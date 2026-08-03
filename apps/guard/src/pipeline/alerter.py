"""Alert generation with severity levels.

Severity policy:

- ``UNREGISTERED`` (cash seen, no POS sale)  -> HIGH, or CRITICAL for large
  amounts / repeat offences within the configured window.
- ``UNVERIFIED`` (POS sale matched, but amount/confidence off) -> MEDIUM,
  or HIGH for large amount differences.
- ``QUIET`` (POS sale, no video confirmation) -> LOW, or MEDIUM on repeats
  at the same register.
- VLM-flagged suspicious behavior -> MEDIUM, HIGH when it coincides with an
  unregistered transaction.

Duplicate protection: an alert is skipped when an open/investigating alert
of the same type already exists for the same video.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from ..models import (
    Alert,
    AlertStatus,
    AlertType,
    AnalysisResult,
    MatchScenario,
    Severity,
    Video,
)
from .matcher import MatchResult

logger = logging.getLogger(__name__)


class Alerter:
    """Turns matcher results into persisted alerts."""

    def __init__(self, settings):
        self.settings = settings

    def create_alerts(
        self,
        db: Session,
        *,
        video: Video,
        matches: List[MatchResult],
        analysis_index: Dict[int, AnalysisResult],
    ) -> List[Alert]:
        """Create alerts for non-verified match results.

        ``analysis_index`` maps ``id(AnalyzedEvent.event)`` to the persisted
        :class:`AnalysisResult` so alerts can reference frames/results.
        """
        alerts: List[Alert] = []
        for match in matches:
            if match.scenario == MatchScenario.VERIFIED:
                continue

            alert_type, severity, title, description = self._classify(db, video, match)
            analysis_result = (
                analysis_index.get(id(match.event.event)) if match.event else None
            )
            if self._is_duplicate(db, video, alert_type):
                logger.info(
                    "skipping duplicate %s alert for video %s",
                    alert_type.value, video.id,
                )
                continue

            alert = Alert(
                tenant_id=video.tenant_id,
                alert_type=alert_type,
                severity=severity,
                title=title,
                description=description,
                camera_id=video.camera_id,
                video_id=video.id,
                analysis_result_id=analysis_result.id if analysis_result else None,
                expected_payment_id=match.payment.id if match.payment else None,
                amount=match.amount_detected,
                expected_amount=match.amount_expected,
                event_timestamp=self._event_datetime(video, match),
                confidence=match.confidence,
                status=AlertStatus.OPEN,
                extra_data={
                    "scenario": match.scenario.value,
                    "reason": match.reason,
                    "amount_difference": match.amount_difference,
                },
            )
            db.add(alert)
            alerts.append(alert)

        # VLM-flagged suspicious behavior gets its own alert even when the
        # transaction itself matched a POS sale.
        alerts.extend(self._behavior_alerts(db, video, matches, analysis_index))

        db.flush()
        logger.info("alerter: created %d alerts for video %s", len(alerts), video.id)
        return alerts

    # ── classification ──────────────────────────────────────────────
    def _classify(
        self, db: Session, video: Video, match: MatchResult
    ) -> Tuple[AlertType, Severity, str, str]:
        currency = self.settings.currency
        amount = match.amount_detected
        expected = match.amount_expected

        if match.scenario == MatchScenario.UNREGISTERED:
            severity = Severity.HIGH
            if (
                amount is not None
                and amount >= float(self.settings.critical_unregistered_amount)
            ):
                severity = Severity.CRITICAL
            elif self._recent_count(db, video, AlertType.UNREGISTERED_TRANSACTION) >= (
                int(self.settings.alert_repeat_threshold) - 1
            ):
                severity = Severity.CRITICAL
            amount_txt = f" (est. {amount:.2f} {currency})" if amount is not None else ""
            return (
                AlertType.UNREGISTERED_TRANSACTION,
                severity,
                f"Unregistered cash transaction{amount_txt}",
                f"{match.reason}. Camera {video.camera_id}"
                + (f", estimated amount {amount:.2f} {currency}." if amount is not None else "."),
            )

        if match.scenario == MatchScenario.UNVERIFIED:
            severity = Severity.MEDIUM
            if (
                match.amount_difference is not None
                and abs(match.amount_difference) >= float(self.settings.high_amount_mismatch)
            ):
                severity = Severity.HIGH
            diff = match.amount_difference
            diff_txt = f" Difference: {diff:+.2f} {currency}." if diff is not None else ""
            return (
                AlertType.UNVERIFIED_TRANSACTION,
                severity,
                "Unverified cash sale",
                f"{match.reason}.{diff_txt} POS amount: "
                f"{expected:.2f} {currency}." if expected is not None else match.reason,
            )

        if match.scenario == MatchScenario.QUIET:
            severity = Severity.LOW
            if self._recent_count(db, video, AlertType.QUIET_POS) >= (
                int(self.settings.alert_repeat_threshold) - 1
            ):
                severity = Severity.MEDIUM
            expected_txt = (
                f"{expected:.2f} {currency}" if expected is not None else "unknown amount"
            )
            return (
                AlertType.QUIET_POS,
                severity,
                f"POS cash sale without visual confirmation ({expected_txt})",
                f"{match.reason}. Register "
                f"{match.payment.register_id if match.payment else 'unknown'}, "
                f"amount {expected_txt}.",
            )

        # VERIFIED never reaches here
        raise ValueError(f"Cannot classify scenario {match.scenario}")

    def _behavior_alerts(
        self,
        db: Session,
        video: Video,
        matches: List[MatchResult],
        analysis_index: Dict[int, AnalysisResult],
    ) -> List[Alert]:
        alerts: List[Alert] = []
        for match in matches:
            if match.event is None or not match.event.vlm.suspicious_behavior:
                continue
            if self._is_duplicate(db, video, AlertType.SUSPICIOUS_BEHAVIOR):
                continue
            severity = (
                Severity.HIGH
                if match.scenario == MatchScenario.UNREGISTERED
                else Severity.MEDIUM
            )
            analysis_result = analysis_index.get(id(match.event.event))
            alert = Alert(
                tenant_id=video.tenant_id,
                alert_type=AlertType.SUSPICIOUS_BEHAVIOR,
                severity=severity,
                title="Suspicious behavior at the register",
                description=(
                    f"VLM flagged suspicious behavior: "
                    f"{match.event.vlm.behavior_notes or 'no details'}."
                ),
                camera_id=video.camera_id,
                video_id=video.id,
                analysis_result_id=analysis_result.id if analysis_result else None,
                amount=match.amount_detected,
                event_timestamp=self._event_datetime(video, match),
                confidence=match.event.vlm.confidence,
                status=AlertStatus.OPEN,
                extra_data={"scenario": match.scenario.value, "reason": match.reason},
            )
            db.add(alert)
            alerts.append(alert)
        return alerts

    # ── helpers ─────────────────────────────────────────────────────
    def _recent_count(
        self, db: Session, video: Video, alert_type: AlertType
    ) -> int:
        """Open/investigating alerts of this type inside the repeat window."""
        since = datetime.utcnow() - timedelta(
            hours=int(self.settings.alert_repeat_window_hours)
        )
        return (
            db.query(Alert)
            .filter(
                Alert.tenant_id == video.tenant_id,
                Alert.alert_type == alert_type,
                Alert.status.in_([AlertStatus.OPEN, AlertStatus.INVESTIGATING]),
                Alert.created_at >= since,
            )
            .count()
        )

    @staticmethod
    def _is_duplicate(db: Session, video: Video, alert_type: AlertType) -> bool:
        return (
            db.query(Alert)
            .filter(
                Alert.video_id == video.id,
                Alert.alert_type == alert_type,
                Alert.status.in_([AlertStatus.OPEN, AlertStatus.INVESTIGATING]),
            )
            .count()
            > 0
        )

    @staticmethod
    def _event_datetime(video: Video, match: MatchResult) -> Optional[datetime]:
        if match.event is not None:
            base = video.recorded_at or video.uploaded_at
            return base + timedelta(seconds=match.event.event.peak_s)
        if match.payment is not None:
            return match.payment.expected_at
        return None
