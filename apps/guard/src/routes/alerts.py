"""Alert management endpoints."""

import logging
from datetime import date, datetime, time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import schemas
from ..db import get_db
from ..models import Alert, AlertStatus, AlertType, Severity

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/alerts", tags=["alerts"])

# Alert lifecycle: open -> investigating -> resolved | false_positive
_ALLOWED_TRANSITIONS = {
    AlertStatus.OPEN: {AlertStatus.INVESTIGATING, AlertStatus.RESOLVED, AlertStatus.FALSE_POSITIVE},
    AlertStatus.INVESTIGATING: {AlertStatus.RESOLVED, AlertStatus.FALSE_POSITIVE},
    AlertStatus.RESOLVED: set(),
    AlertStatus.FALSE_POSITIVE: set(),
}
_TERMINAL = {AlertStatus.RESOLVED, AlertStatus.FALSE_POSITIVE}


@router.get("", response_model=schemas.AlertListResponse)
def list_alerts(
    tenant_id: int = Query(1),
    status_filter: Optional[AlertStatus] = Query(None, alias="status"),
    severity: Optional[Severity] = Query(None),
    alert_type: Optional[AlertType] = Query(None),
    camera_id: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Alert).filter(Alert.tenant_id == tenant_id)
    if status_filter:
        query = query.filter(Alert.status == status_filter)
    if severity:
        query = query.filter(Alert.severity == severity)
    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)
    if camera_id:
        query = query.filter(Alert.camera_id == camera_id)
    if date_from:
        query = query.filter(Alert.created_at >= datetime.combine(date_from, time.min))
    if date_to:
        query = query.filter(Alert.created_at <= datetime.combine(date_to, time.max))

    total = query.count()
    alerts = (
        query.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()
    )
    return schemas.AlertListResponse(total=total, items=alerts)


@router.get("/{alert_id}", response_model=schemas.AlertResponse)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


def _apply_status(alert: Alert, new_status: AlertStatus, notes: Optional[str], by: Optional[str]) -> Alert:
    allowed = _ALLOWED_TRANSITIONS.get(alert.status, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=409,
            detail=f"Invalid transition {alert.status.value} -> {new_status.value}",
        )
    alert.status = new_status
    if notes:
        alert.resolution_notes = notes
    if by:
        alert.resolved_by = by
    if new_status in _TERMINAL:
        alert.resolved_at = datetime.utcnow()
    return alert


@router.patch("/{alert_id}", response_model=schemas.AlertResponse)
def update_alert(
    alert_id: int,
    payload: schemas.AlertUpdate,
    db: Session = Depends(get_db),
):
    """Transition an alert through its lifecycle (acknowledge/resolve/dismiss)."""
    alert = db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    _apply_status(alert, payload.status, payload.resolution_notes, payload.resolved_by)
    db.commit()
    db.refresh(alert)
    return alert


@router.post("/{alert_id}/resolve", response_model=schemas.AlertResponse)
def resolve_alert(
    alert_id: int,
    payload: schemas.AlertResolution,
    db: Session = Depends(get_db),
):
    """Backwards-compatible resolve endpoint used by the dashboard."""
    alert = db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    _apply_status(alert, payload.status, payload.notes, payload.resolved_by)
    db.commit()
    db.refresh(alert)
    return alert
