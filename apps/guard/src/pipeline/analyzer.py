"""VLM scene analysis with SmolVLM2.

Each cash event is analyzed by a vision-language model that must answer with
a strict JSON object (see :class:`VLMOutput`). Detector hints are injected
into the prompt so the VLM can focus on what YOLO already found.

Transformers/torch are imported lazily; ``settings.use_mock_models`` enables
a deterministic analyzer (derived from the YOLO detections) for local
development and tests.
"""

import json
import logging
import re
from typing import List, Optional

from pydantic import BaseModel, Field

from .detector import CashEvent, FrameDetections

logger = logging.getLogger(__name__)


class VLMOutput(BaseModel):
    """Structured scene analysis produced by the VLM."""

    transaction_occurred: bool = False
    cash_visible: bool = False
    cash_amount_estimate: Optional[float] = None
    currency: Optional[str] = None
    people_count: int = 0
    drawer_open: bool = False
    pos_screen_visible: bool = False
    suspicious_behavior: bool = False
    behavior_notes: str = ""
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


_JSON_BLOCK = re.compile(r"\{.*\}", re.DOTALL)


def parse_structured_output(text: str) -> VLMOutput:
    """Parse the VLM raw answer into a validated :class:`VLMOutput`.

    Tolerates markdown code fences and surrounding chatter; normalizes
    confidence given as 0-100 into the 0-1 range.
    """
    if not text:
        raise ValueError("Empty VLM output")
    cleaned = text.replace("```json", " ").replace("```", " ").strip()
    match = _JSON_BLOCK.search(cleaned)
    if not match:
        raise ValueError(f"No JSON object found in VLM output: {text[:200]!r}")
    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON in VLM output: {exc}") from exc
    if not isinstance(data, dict):
        raise ValueError("VLM output JSON is not an object")

    confidence = data.get("confidence", 0.0)
    try:
        confidence = float(confidence)
    except (TypeError, ValueError):
        confidence = 0.0
    if confidence > 1.0:  # model answered on a 0-100 scale
        confidence = confidence / 100.0
    data["confidence"] = min(1.0, max(0.0, confidence))

    amount = data.get("cash_amount_estimate")
    if amount is not None:
        try:
            data["cash_amount_estimate"] = float(amount)
        except (TypeError, ValueError):
            data["cash_amount_estimate"] = None

    return VLMOutput(**{k: v for k, v in data.items() if k in VLMOutput.model_fields})


class VLMAnalyzer:
    """Analyzes cash events with SmolVLM2 and returns structured JSON."""

    PROMPT_TEMPLATE = (
        "You are a loss-prevention analyst reviewing a security camera frame "
        "from the cash register area of a bar/restaurant.\n"
        "Object detector hints for this frame: {hints}.\n"
        "Analyze the image and answer ONLY with a JSON object (no markdown, "
        "no explanation) with exactly these fields:\n"
        "{{\n"
        '  "transaction_occurred": true/false,   // money is being exchanged\n'
        '  "cash_visible": true/false,           // banknotes/coins visible\n'
        '  "cash_amount_estimate": number|null,  // total visible cash, null if unclear\n'
        '  "currency": "EUR"|"USD"|null,\n'
        '  "people_count": integer,\n'
        '  "drawer_open": true/false,            // cash drawer/till open\n'
        '  "pos_screen_visible": true/false,\n'
        '  "suspicious_behavior": true/false,    // concealment, pocketing cash, '
        "drawer opened without a sale\n"
        '  "behavior_notes": "one short sentence",\n'
        '  "confidence": number                  // 0 to 1\n'
        "}}\n"
        "Be conservative: suspicious_behavior=true only for clear red flags."
    )

    MAX_EVENT_FRAMES = 3  # keyframes analyzed per event

    def __init__(self, settings):
        self.settings = settings
        self._mock = bool(settings.use_mock_models)
        self._model = None
        self._processor = None
        if not self._mock:
            self._load()

    # ── model management ────────────────────────────────────────────
    def _load(self) -> None:
        import torch  # lazy
        from transformers import AutoModelForVision2Seq, AutoProcessor  # lazy

        name = self.settings.vlm_model_name
        device = self.settings.resolved_device
        dtype = torch.float16 if device == "cuda" else torch.float32
        logger.info("Loading VLM %s on %s (%s)", name, device, dtype)
        self._processor = AutoProcessor.from_pretrained(name)
        self._model = AutoModelForVision2Seq.from_pretrained(
            name,
            torch_dtype=dtype,
            _attn_implementation="eager",
        ).to(device)
        self._model.eval()

    @property
    def model_loaded(self) -> bool:
        return self._mock or self._model is not None

    # ── public API ──────────────────────────────────────────────────
    def analyze_event(self, event: CashEvent) -> VLMOutput:
        """Analyze up to N keyframes of an event and aggregate the answers."""
        keyframes = self._select_keyframes(event)
        outputs = [self.analyze_frame(fd) for fd in keyframes]
        if not outputs:
            return VLMOutput()
        if self._mock:
            return outputs[0]
        return self._aggregate(outputs)

    def analyze_frame(self, fd: FrameDetections) -> VLMOutput:
        if self._mock:
            return self._mock_analyze(fd)
        hints = self._detector_hints(fd)
        prompt = self.PROMPT_TEMPLATE.format(hints=hints)
        raw = self._generate(fd.frame.path, prompt)
        try:
            return parse_structured_output(raw)
        except ValueError:
            logger.warning("Unparseable VLM output, using safe fallback: %s", raw[:200])
            return VLMOutput(behavior_notes="vlm_parse_error")

    # ── internals ───────────────────────────────────────────────────
    def _select_keyframes(self, event: CashEvent) -> List[FrameDetections]:
        frames = event.frames or [event.peak_frame]
        picks = {event.peak_frame.frame.index: event.peak_frame}
        picks.setdefault(frames[0].frame.index, frames[0])
        picks.setdefault(frames[-1].frame.index, frames[-1])
        ordered = sorted(picks.values(), key=lambda f: f.frame.timestamp_s)
        return ordered[: self.MAX_EVENT_FRAMES]

    @staticmethod
    def _detector_hints(fd: FrameDetections) -> str:
        if not fd.detections:
            return "no objects detected"
        counts: dict = {}
        best_conf: dict = {}
        for d in fd.detections:
            counts[d.class_name] = counts.get(d.class_name, 0) + 1
            best_conf[d.class_name] = max(best_conf.get(d.class_name, 0.0), d.confidence)
        return ", ".join(
            f"{name} x{counts[name]} (max conf {best_conf[name]:.2f})"
            for name in sorted(counts)
        )

    def _generate(self, image_path: str, prompt: str) -> str:
        import torch
        from PIL import Image

        device = self.settings.resolved_device
        image = Image.open(image_path).convert("RGB")
        messages = [
            {
                "role": "user",
                "content": [{"type": "image"}, {"type": "text", "text": prompt}],
            }
        ]
        text = self._processor.apply_chat_template(messages, add_generation_prompt=True)
        inputs = self._processor(text=text, images=[image], return_tensors="pt").to(device)
        with torch.inference_mode():
            generated = self._model.generate(
                **inputs,
                max_new_tokens=int(self.settings.vlm_max_new_tokens),
                do_sample=False,
            )
        trimmed = generated[:, inputs["input_ids"].shape[1]:]
        return self._processor.batch_decode(trimmed, skip_special_tokens=True)[0]

    @staticmethod
    def _aggregate(outputs: List[VLMOutput]) -> VLMOutput:
        """Majority/max aggregation across an event's keyframes."""
        estimates = [o.cash_amount_estimate for o in outputs if o.cash_amount_estimate is not None]
        return VLMOutput(
            transaction_occurred=any(o.transaction_occurred for o in outputs),
            cash_visible=any(o.cash_visible for o in outputs),
            cash_amount_estimate=max(estimates) if estimates else None,
            currency=next((o.currency for o in outputs if o.currency), None),
            people_count=max(o.people_count for o in outputs),
            drawer_open=any(o.drawer_open for o in outputs),
            pos_screen_visible=any(o.pos_screen_visible for o in outputs),
            suspicious_behavior=any(o.suspicious_behavior for o in outputs),
            behavior_notes=" | ".join(
                o.behavior_notes for o in outputs if o.behavior_notes
            )[:500],
            confidence=max(o.confidence for o in outputs),
        )

    # ── deterministic mock (dev/tests) ──────────────────────────────
    def _mock_analyze(self, fd: FrameDetections) -> VLMOutput:
        cash_conf = fd.cash_confidence
        cash_visible = cash_conf >= float(self.settings.min_event_confidence)
        confidence = round(min(0.95, 0.5 + cash_conf / 2.0), 3) if cash_visible else 0.4
        return VLMOutput(
            transaction_occurred=cash_visible and fd.has_hand,
            cash_visible=cash_visible,
            cash_amount_estimate=None,  # mock never estimates amounts
            currency=self.settings.currency if cash_visible else None,
            people_count=fd.people_count,
            drawer_open=fd.has_drawer,
            pos_screen_visible=fd.has_pos_screen,
            suspicious_behavior=False,
            behavior_notes="mock analysis derived from detector output",
            confidence=confidence,
        )
