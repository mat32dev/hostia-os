"""RLHF feedback loop.

Owners review alerts and label them (true positive / false positive /
uncertain). The loop has two effects:

1. **Online**: rolling precision is turned into a confidence-threshold
   adjustment consumed by the matcher (fewer false alarms when precision is
   high, stricter matching when it degrades).
2. **Offline**: labeled alerts are exportable as a JSONL dataset
   (frame analysis + VLM output + human label) for fine-tuning / DPO runs.
"""

import json
import logging
import os
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from ..models import Alert, AlertStatus, Feedback, FeedbackLabel
from ..schemas import FeedbackStats

logger = logging.getLogger(__name__)


class FeedbackService:
    """Records owner feedback and closes the learning loop."""

    def __init__(self, settings):
        self.settings = settings

    # ── recording ───────────────────────────────────────────────────
    def submit(
        self,
        db: Session,
        *,
        alert_id: int,
        label: FeedbackLabel,
        tenant_id: int = 1,
        notes: Optional[str] = None,
        created_by: Optional[str] = None,
    ) -> Feedback:
        """Store feedback and reflect it on the alert lifecycle."""
        alert = db.get(Alert, alert_id)
        if alert is None:
            raise LookupError(f"Alert {alert_id} not found")

        feedback = Feedback(
            tenant_id=tenant_id,
            alert_id=alert_id,
            label=label,
            notes=notes,
            created_by=created_by,
        )
        db.add(feedback)

        # Owner corrections drive the alert state machine.
        if label == FeedbackLabel.FALSE_POSITIVE:
            alert.status = AlertStatus.FALSE_POSITIVE
            alert.resolution_notes = notes or alert.resolution_notes
            alert.resolved_at = datetime.utcnow()
            alert.resolved_by = created_by or alert.resolved_by
        elif label == FeedbackLabel.TRUE_POSITIVE and alert.status == AlertStatus.OPEN:
            alert.status = AlertStatus.INVESTIGATING

        db.flush()
        logger.info("feedback: alert %s labeled %s", alert_id, label.value)
        return feedback

    # ── statistics ──────────────────────────────────────────────────
    def stats(self, db: Session, tenant_id: Optional[int] = None) -> FeedbackStats:
        rows = self._recent_feedback(db, tenant_id)
        tp = sum(1 for f in rows if f.label == FeedbackLabel.TRUE_POSITIVE)
        fp = sum(1 for f in rows if f.label == FeedbackLabel.FALSE_POSITIVE)
        unc = sum(1 for f in rows if f.label == FeedbackLabel.UNCERTAIN)

        by_type: dict = {}
        type_rows: dict = {}
        for f in rows:
            if f.alert is None or f.label == FeedbackLabel.UNCERTAIN:
                continue
            bucket = type_rows.setdefault(f.alert.alert_type.value, [0, 0])
            if f.label == FeedbackLabel.TRUE_POSITIVE:
                bucket[0] += 1
            else:
                bucket[1] += 1
        for alert_type, (t, f_) in type_rows.items():
            by_type[alert_type] = round(t / (t + f_), 4) if (t + f_) else None

        return FeedbackStats(
            total=len(rows),
            true_positives=tp,
            false_positives=fp,
            uncertain=unc,
            precision=round(tp / (tp + fp), 4) if (tp + fp) else None,
            precision_by_type=by_type,
            confidence_adjustment=self.confidence_adjustment(db, tenant_id),
        )

    # ── online adaptation ───────────────────────────────────────────
    def confidence_adjustment(self, db: Session, tenant_id: Optional[int] = None) -> float:
        """Threshold delta for the matcher, derived from rolling precision.

        Low precision  -> raise the bar (positive delta, fewer weak matches).
        High precision -> relax slightly (negative delta, catch more).
        """
        rows = [
            f
            for f in self._recent_feedback(db, tenant_id)
            if f.label in (FeedbackLabel.TRUE_POSITIVE, FeedbackLabel.FALSE_POSITIVE)
        ]
        if len(rows) < int(self.settings.feedback_min_samples):
            return 0.0
        tp = sum(1 for f in rows if f.label == FeedbackLabel.TRUE_POSITIVE)
        precision = tp / len(rows)
        if precision < 0.50:
            return 0.15
        if precision < 0.70:
            return 0.05
        if precision >= 0.95:
            return -0.05
        return 0.0

    # ── offline dataset ─────────────────────────────────────────────
    def export_dataset(self, db: Session, tenant_id: Optional[int] = None) -> str:
        """Export labeled alerts as JSONL for fine-tuning/RLHF. Returns path."""
        rows = (
            db.query(Feedback)
            .join(Alert, Feedback.alert_id == Alert.id)
            .filter(Feedback.tenant_id == tenant_id if tenant_id else True)
            .order_by(Feedback.created_at)
            .all()
        )
        path = self.settings.feedback_export_path
        if not os.path.isabs(path):
            path = os.path.join(self.settings.local_storage_dir, path)
        os.makedirs(os.path.dirname(path), exist_ok=True)

        with open(path, "w", encoding="utf-8") as fh:
            for fb in rows:
                alert = fb.alert
                record = {
                    "feedback_id": fb.id,
                    "alert_id": fb.alert_id,
                    "alert_type": alert.alert_type.value if alert else None,
                    "label": fb.label.value,
                    "severity": alert.severity.value if alert else None,
                    "detections": (
                        alert.analysis_result.detections
                        if alert and alert.analysis_result
                        else None
                    ),
                    "vlm_output": (
                        alert.analysis_result.vlm_output
                        if alert and alert.analysis_result
                        else None
                    ),
                    "frame_storage_key": (
                        alert.analysis_result.frame_storage_key
                        if alert and alert.analysis_result
                        else None
                    ),
                    "notes": fb.notes,
                    "created_at": fb.created_at.isoformat(),
                }
                fh.write(json.dumps(record, default=str) + "\n")
            for fb in rows:  # mark as consumed by the training loop
                fb.applied = True
        db.flush()
        logger.info("feedback: exported %d records to %s", len(rows), path)
        return path

    # ── helpers ─────────────────────────────────────────────────────
    def _recent_feedback(self, db: Session, tenant_id: Optional[int]) -> list:
        query = db.query(Feedback).order_by(Feedback.created_at.desc())
        if tenant_id is not None:
            query = query.filter(Feedback.tenant_id == tenant_id)
        return query.limit(int(self.settings.feedback_window)).all()
