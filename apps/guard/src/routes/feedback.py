"""Feedback endpoints (RLHF loop)."""

import logging
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .. import schemas
from ..config import get_settings
from ..db import get_db
from ..pipeline.feedback import FeedbackService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post(
    "",
    response_model=schemas.FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
)
def submit_feedback(payload: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    """Record the owner's verdict on an alert (drives the RLHF loop)."""
    service = FeedbackService(get_settings())
    try:
        feedback = service.submit(
            db,
            alert_id=payload.alert_id,
            label=payload.label,
            tenant_id=payload.tenant_id,
            notes=payload.notes,
            created_by=payload.created_by,
        )
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("/stats", response_model=schemas.FeedbackStats)
def feedback_stats(
    tenant_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Rolling precision and the active matcher-threshold adjustment."""
    service = FeedbackService(get_settings())
    return service.stats(db, tenant_id)


@router.get("/export")
def export_feedback_dataset(
    tenant_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Export labeled alerts as JSONL (fine-tuning / DPO dataset)."""
    service = FeedbackService(get_settings())
    path = service.export_dataset(db, tenant_id)
    db.commit()
    if not os.path.isfile(path):
        raise HTTPException(status_code=500, detail="Export failed")
    return FileResponse(
        path,
        media_type="application/x-ndjson",
        filename="guard_rlhf_dataset.jsonl",
    )
