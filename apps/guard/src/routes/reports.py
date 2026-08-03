"""Report endpoints (analytics, exports) + expected-payment registration.

The POS agent registers cash sales here (``POST /expected-payments``); the
matcher later validates them against the video events.
"""

import csv
import io
import logging
from datetime import date, datetime, time, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import schemas
from ..config import get_settings
from ..db import get_db
from ..models import (
    Alert,
    AlertStatus,
    AlertType,
    AnalysisResult,
    ExpectedPayment,
    MatchScenario,
    PaymentStatus,
    Video,
    VideoStatus,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["reports"])


# ─── Expected payments (POS integration) ────────────────────────────
@router.post(
    "/expected-payments",
    response_model=schemas.ExpectedPaymentResponse,
    status_code=201,
)
def register_expected_payment(
    payment: schemas.ExpectedPaymentCreate, db: Session = Depends(get_db)
):
    """Called by the POS agent when a sale is registered."""
    expected_at = payment.timestamp
    if expected_at.tzinfo is not None:
        expected_at = expected_at.replace(tzinfo=None)  # store naive UTC
    db_payment = ExpectedPayment(
        tenant_id=payment.tenant_id,
        transaction_id=str(payment.transaction_id),
        register_id=payment.register_id,
        amount=payment.amount,
        table_number=payment.table_number,
        payment_method=(payment.payment_method or "cash").lower(),
        expected_at=expected_at,
        window_seconds=payment.window_minutes * 60,
        status=PaymentStatus.PENDING,
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


@router.get("/expected-payments", response_model=list[schemas.ExpectedPaymentResponse])
def list_expected_payments(
    tenant_id: int = Query(1),
    status_filter: Optional[PaymentStatus] = Query(None, alias="status"),
    payment_method: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(ExpectedPayment).filter(ExpectedPayment.tenant_id == tenant_id)
    if status_filter:
        query = query.filter(ExpectedPayment.status == status_filter)
    if payment_method:
        query = query.filter(ExpectedPayment.payment_method == payment_method.lower())
    if date_from:
        query = query.filter(ExpectedPayment.expected_at >= datetime.combine(date_from, time.min))
    if date_to:
        query = query.filter(ExpectedPayment.expected_at <= datetime.combine(date_to, time.max))
    return (
        query.order_by(ExpectedPayment.expected_at.desc()).offset(offset).limit(limit).all()
    )


# ─── Reports ────────────────────────────────────────────────────────
def _range(date_from: Optional[date], date_to: Optional[date]) -> tuple:
    end = datetime.combine(date_to or date.today(), time.max)
    start = datetime.combine(date_from or (end.date() - timedelta(days=1)), time.min)
    return start, end


@router.get("/reports/summary", response_model=schemas.ReportSummary)
def report_summary(
    tenant_id: int = Query(1),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    settings = get_settings()
    start, end = _range(date_from, date_to)

    videos_processed = (
        db.query(Video)
        .filter(
            Video.tenant_id == tenant_id,
            Video.status == VideoStatus.COMPLETED,
            Video.uploaded_at.between(start, end),
        )
        .count()
    )

    results = (
        db.query(AnalysisResult)
        .filter(
            AnalysisResult.tenant_id == tenant_id,
            AnalysisResult.created_at.between(start, end),
        )
        .all()
    )
    scenarios = schemas.ScenarioCounts(
        verified=sum(1 for r in results if r.match_scenario == MatchScenario.VERIFIED),
        unverified=sum(1 for r in results if r.match_scenario == MatchScenario.UNVERIFIED),
        unregistered=sum(1 for r in results if r.match_scenario == MatchScenario.UNREGISTERED),
        quiet=0,
    )

    alerts = (
        db.query(Alert)
        .filter(Alert.tenant_id == tenant_id, Alert.created_at.between(start, end))
        .all()
    )
    scenarios.quiet = sum(1 for a in alerts if a.alert_type == AlertType.QUIET_POS)

    by_severity: dict = {}
    by_type: dict = {}
    for alert in alerts:
        by_severity[alert.severity.value] = by_severity.get(alert.severity.value, 0) + 1
        by_type[alert.alert_type.value] = by_type.get(alert.alert_type.value, 0) + 1

    event_matches = scenarios.verified + scenarios.unverified + scenarios.unregistered
    match_rate = round(scenarios.verified / event_matches, 4) if event_matches else None

    amount_at_risk = sum(
        a.amount or 0.0
        for a in alerts
        if a.alert_type == AlertType.UNREGISTERED_TRANSACTION
    )

    return schemas.ReportSummary(
        tenant_id=tenant_id,
        date_from=start,
        date_to=end,
        videos_processed=videos_processed,
        events_detected=len(results),
        scenarios=scenarios,
        match_rate=match_rate,
        alerts_total=len(alerts),
        alerts_by_severity=by_severity,
        alerts_by_type=by_type,
        open_alerts=sum(
            1
            for a in alerts
            if a.status in (AlertStatus.OPEN, AlertStatus.INVESTIGATING)
        ),
        amount_at_risk=round(amount_at_risk, 2),
        currency=settings.currency,
    )


@router.get("/reports/daily/{report_date}", response_model=schemas.DailyReport)
def daily_report(
    report_date: date,
    tenant_id: int = Query(1),
    db: Session = Depends(get_db),
):
    """Backwards-compatible daily report (``/v1/reports/daily/2026-08-03``)."""
    start = datetime.combine(report_date, time.min)
    end = datetime.combine(report_date, time.max)

    results = (
        db.query(AnalysisResult)
        .filter(
            AnalysisResult.tenant_id == tenant_id,
            AnalysisResult.created_at.between(start, end),
        )
        .all()
    )
    alerts = (
        db.query(Alert)
        .filter(Alert.tenant_id == tenant_id, Alert.created_at.between(start, end))
        .order_by(Alert.created_at.desc())
        .all()
    )
    matched = (
        db.query(ExpectedPayment)
        .filter(
            ExpectedPayment.tenant_id == tenant_id,
            ExpectedPayment.status == PaymentStatus.MATCHED,
            ExpectedPayment.expected_at.between(start, end),
        )
        .count()
    )
    discrepancies = sum(
        1
        for a in alerts
        if a.alert_type
        in (AlertType.UNREGISTERED_TRANSACTION, AlertType.UNVERIFIED_TRANSACTION)
    )
    return schemas.DailyReport(
        date=report_date.isoformat(),
        total_frames_analyzed=len(results),
        suspicious_activities=sum(
            1 for r in results if r.match_scenario == MatchScenario.UNREGISTERED
        ),
        alerts=[schemas.AlertResponse.model_validate(a) for a in alerts],
        expected_payments_matched=matched,
        discrepancies=discrepancies,
    )


@router.get("/reports/export.csv")
def export_alerts_csv(
    tenant_id: int = Query(1),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    """Download the alerts of a period as CSV."""
    start, end = _range(date_from, date_to)
    alerts = (
        db.query(Alert)
        .filter(Alert.tenant_id == tenant_id, Alert.created_at.between(start, end))
        .order_by(Alert.created_at)
        .all()
    )

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "id", "created_at", "type", "severity", "status", "camera_id",
            "video_id", "amount", "expected_amount", "confidence", "title",
        ]
    )
    for a in alerts:
        writer.writerow(
            [
                a.id, a.created_at.isoformat(), a.alert_type.value, a.severity.value,
                a.status.value, a.camera_id, a.video_id or "", a.amount or "",
                a.expected_amount or "", a.confidence, a.title,
            ]
        )
    buffer.seek(0)
    filename = f"guard_alerts_{start.date()}_{end.date()}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
