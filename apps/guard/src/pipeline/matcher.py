"""Match detected cash events against expected POS payments.

The detection matrix (only *cash* payments are validated on video):

===========  =================  ============================
POS sale     Video confirmed    Scenario
===========  =================  ============================
yes          yes                ``VERIFIED``
yes          yes (but off)      ``UNVERIFIED`` (amount/confidence mismatch)
no           yes                ``UNREGISTERED`` (cash handling without a sale)
yes          no                 ``QUIET`` (POS sale with no visual confirmation)
===========  =================  ============================
"""

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Optional, Sequence

from ..models import ExpectedPayment, MatchScenario
from .analyzer import VLMOutput
from .detector import CashEvent

logger = logging.getLogger(__name__)


@dataclass
class AnalyzedEvent:
    """A cash event enriched with its VLM analysis."""

    event: CashEvent
    vlm: VLMOutput


@dataclass
class MatchResult:
    scenario: MatchScenario
    event: Optional[AnalyzedEvent] = None
    payment: Optional[ExpectedPayment] = None
    amount_detected: Optional[float] = None
    amount_expected: Optional[float] = None
    amount_difference: Optional[float] = None
    confidence: float = 0.0
    reason: str = ""


class PaymentMatcher:
    """Time-window matcher between video cash events and POS payments."""

    def __init__(self, settings):
        self.settings = settings

    def match(
        self,
        analyzed_events: Sequence[AnalyzedEvent],
        payments: Sequence[ExpectedPayment],
        reference_time: datetime,
        confidence_adjustment: float = 0.0,
    ) -> List[MatchResult]:
        """Match events to payments.

        ``reference_time`` is the absolute timestamp of second 0 of the
        video (``video.recorded_at`` or upload time). ``confidence_adjustment``
        comes from the RLHF feedback loop and shifts the minimum confidence
        required to call a match verified.
        """
        window = float(self.settings.match_window_seconds)
        tolerance = float(self.settings.amount_mismatch_tolerance)
        min_confidence = min(
            0.95,
            max(0.05, float(self.settings.min_match_confidence) + confidence_adjustment),
        )

        cash_payments = [p for p in payments if (p.payment_method or "cash").lower() == "cash"]
        used_payment_ids: set = set()
        results: List[MatchResult] = []

        for ae in analyzed_events:
            event_dt = reference_time + timedelta(seconds=ae.event.peak_s)
            candidates = [
                p
                for p in cash_payments
                if id(p) not in used_payment_ids
                and abs((p.expected_at - event_dt).total_seconds())
                <= max(window, float(p.window_seconds or 0))
            ]
            payment = (
                min(candidates, key=lambda p: abs((p.expected_at - event_dt).total_seconds()))
                if candidates
                else None
            )

            if payment is None:
                results.append(
                    MatchResult(
                        scenario=MatchScenario.UNREGISTERED,
                        event=ae,
                        amount_detected=ae.vlm.cash_amount_estimate,
                        confidence=round(
                            max(ae.event.confidence, ae.vlm.confidence), 4
                        ),
                        reason="Cash handling detected on video with no matching POS sale",
                    )
                )
                continue

            used_payment_ids.add(id(payment))
            estimate = ae.vlm.cash_amount_estimate
            confidence = round(max(ae.event.confidence, ae.vlm.confidence), 4)

            if estimate is not None and abs(estimate - payment.amount) > tolerance:
                results.append(
                    MatchResult(
                        scenario=MatchScenario.UNVERIFIED,
                        event=ae,
                        payment=payment,
                        amount_detected=estimate,
                        amount_expected=payment.amount,
                        amount_difference=round(estimate - payment.amount, 2),
                        confidence=confidence,
                        reason=(
                            f"Visual estimate {estimate:.2f} differs from POS "
                            f"amount {payment.amount:.2f} by more than {tolerance:.2f}"
                        ),
                    )
                )
            elif confidence < min_confidence:
                results.append(
                    MatchResult(
                        scenario=MatchScenario.UNVERIFIED,
                        event=ae,
                        payment=payment,
                        amount_detected=estimate,
                        amount_expected=payment.amount,
                        confidence=confidence,
                        reason=(
                            f"Match confidence {confidence:.2f} below threshold "
                            f"{min_confidence:.2f}"
                        ),
                    )
                )
            else:
                results.append(
                    MatchResult(
                        scenario=MatchScenario.VERIFIED,
                        event=ae,
                        payment=payment,
                        amount_detected=estimate,
                        amount_expected=payment.amount,
                        confidence=confidence,
                        reason="Video event confirmed by POS sale",
                    )
                )

        # POS cash sales with no video event -> quiet scenario
        for payment in cash_payments:
            if id(payment) in used_payment_ids:
                continue
            results.append(
                MatchResult(
                    scenario=MatchScenario.QUIET,
                    payment=payment,
                    amount_expected=payment.amount,
                    confidence=0.0,
                    reason=(
                        "Cash sale registered in POS without visual "
                        "confirmation on camera"
                    ),
                )
            )

        logger.info(
            "matcher: %d events, %d cash payments -> %s",
            len(analyzed_events),
            len(cash_payments),
            {s.value: sum(1 for r in results if r.scenario == s) for s in MatchScenario},
        )
        return results
