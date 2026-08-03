"""YOLOv8 object detection for the cash-register scene.

Detects people, hands, cash, POS screens and the cash drawer, then groups
per-frame detections into *cash events* (contiguous stretches of activity
where money is likely changing hands).

The custom model (``settings.yolo_model_path``) is expected to be trained
with classes like ``person``, ``hand``, ``cash``, ``pos_screen`` and
``cash_drawer``. When it is missing we fall back to a COCO-pretrained
YOLOv8 and map the closest classes (e.g. ``tv``/``laptop`` -> ``pos_screen``).

Ultralytics/torch are imported lazily so the module stays importable in
lightweight environments. ``settings.use_mock_models`` enables a
deterministic heuristic detector for local development and tests.
"""

import logging
import os
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence

from .extractor import ExtractedFrame

logger = logging.getLogger(__name__)

CANONICAL_CLASSES = ("person", "hand", "cash", "pos_screen", "cash_drawer")

# Maps raw model class names (custom or COCO) onto our canonical classes.
_NAME_MAP: Dict[str, str] = {
    "person": "person",
    "hand": "hand",
    "hands": "hand",
    "cash": "cash",
    "money": "cash",
    "banknote": "cash",
    "banknotes": "cash",
    "bill": "cash",
    "bills": "cash",
    "coin": "cash",
    "coins": "cash",
    "pos": "pos_screen",
    "pos_screen": "pos_screen",
    "pos screen": "pos_screen",
    "terminal": "pos_screen",
    "screen": "pos_screen",
    "monitor": "pos_screen",
    "tv": "pos_screen",          # COCO fallback
    "laptop": "pos_screen",      # COCO fallback
    "cell phone": "pos_screen",  # COCO fallback
    "drawer": "cash_drawer",
    "cash_drawer": "cash_drawer",
    "cash drawer": "cash_drawer",
    "register": "cash_drawer",
    "cash_register": "cash_drawer",
    "till": "cash_drawer",
}


@dataclass
class Detection:
    class_name: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]


@dataclass
class FrameDetections:
    frame: ExtractedFrame
    detections: List[Detection] = field(default_factory=list)

    def _by_class(self, name: str) -> List[Detection]:
        return [d for d in self.detections if d.class_name == name]

    @property
    def has_cash(self) -> bool:
        return any(d.class_name == "cash" for d in self.detections)

    @property
    def cash_confidence(self) -> float:
        return max((d.confidence for d in self._by_class("cash")), default=0.0)

    @property
    def has_hand(self) -> bool:
        return any(d.class_name == "hand" for d in self.detections)

    @property
    def has_pos_screen(self) -> bool:
        return any(d.class_name == "pos_screen" for d in self.detections)

    @property
    def has_drawer(self) -> bool:
        return any(d.class_name == "cash_drawer" for d in self.detections)

    @property
    def people_count(self) -> int:
        return len(self._by_class("person"))

    @property
    def hand_cash_interaction(self) -> bool:
        """A hand overlapping/near cash or the drawer = physical handling."""
        hands = self._by_class("hand")
        targets = self._by_class("cash") + self._by_class("cash_drawer")
        return any(
            boxes_close(hand.bbox, target.bbox)
            for hand in hands
            for target in targets
        )


@dataclass
class CashEvent:
    start_s: float
    end_s: float
    peak_s: float
    confidence: float
    cash_confidence: float
    peak_frame: FrameDetections
    frames: List[FrameDetections] = field(default_factory=list)
    hand_cash_interaction: bool = False
    people_count: int = 0
    drawer_open: bool = False
    pos_screen_visible: bool = False

    def to_dict(self) -> dict:
        return {
            "start_s": self.start_s,
            "end_s": self.end_s,
            "peak_s": self.peak_s,
            "confidence": round(self.confidence, 4),
            "cash_confidence": round(self.cash_confidence, 4),
            "hand_cash_interaction": self.hand_cash_interaction,
            "people_count": self.people_count,
            "drawer_open": self.drawer_open,
            "pos_screen_visible": self.pos_screen_visible,
            "frame_indices": [fd.frame.index for fd in self.frames],
            "detections": [
                {
                    "frame_index": fd.frame.index,
                    "timestamp_s": fd.frame.timestamp_s,
                    "objects": [
                        {
                            "class": d.class_name,
                            "confidence": round(d.confidence, 4),
                            "bbox": [round(v, 1) for v in d.bbox],
                        }
                        for d in fd.detections
                    ],
                }
                for fd in self.frames
            ],
        }


def boxes_close(box_a: Sequence[float], box_b: Sequence[float], margin: float = 40.0) -> bool:
    """True when two [x1,y1,x2,y2] boxes overlap (expanded by ``margin`` px)."""
    ax1, ay1, ax2, ay2 = box_a
    bx1, by1, bx2, by2 = box_b
    return not (
        ax2 + margin < bx1
        or bx2 + margin < ax1
        or ay2 + margin < by1
        or by2 + margin < ay1
    )


def _make_event(group: List[FrameDetections]) -> CashEvent:
    peak = max(group, key=lambda fd: fd.cash_confidence)
    confs = [fd.cash_confidence for fd in group]
    max_conf = max(confs)
    mean_conf = sum(confs) / len(confs)
    return CashEvent(
        start_s=group[0].frame.timestamp_s,
        end_s=group[-1].frame.timestamp_s,
        peak_s=peak.frame.timestamp_s,
        confidence=round(0.7 * max_conf + 0.3 * mean_conf, 4),
        cash_confidence=round(max_conf, 4),
        peak_frame=peak,
        frames=list(group),
        hand_cash_interaction=any(fd.hand_cash_interaction for fd in group),
        people_count=max(fd.people_count for fd in group),
        drawer_open=any(fd.has_drawer for fd in group),
        pos_screen_visible=any(fd.has_pos_screen for fd in group),
    )


def group_events(
    frame_detections: Sequence[FrameDetections],
    gap_tolerance_s: float = 3.0,
    min_cash_confidence: float = 0.30,
) -> List[CashEvent]:
    """Group interesting frames into cash events.

    A frame is *interesting* when cash is visible, a hand touches cash/the
    drawer, or a hand is seen at the open drawer. Interesting frames closer
    than ``gap_tolerance_s`` belong to the same event.
    """
    events: List[CashEvent] = []
    current: List[FrameDetections] = []

    def interesting(fd: FrameDetections) -> bool:
        if fd.cash_confidence >= min_cash_confidence:
            return True
        if fd.hand_cash_interaction:
            return True
        return fd.has_hand and fd.has_drawer

    for fd in frame_detections:
        if not interesting(fd):
            continue
        if (
            current
            and fd.frame.timestamp_s - current[-1].frame.timestamp_s > gap_tolerance_s
        ):
            events.append(_make_event(current))
            current = []
        current.append(fd)

    if current:
        events.append(_make_event(current))
    return events


class CashDetector:
    """Runs YOLOv8 over extracted frames and builds cash events."""

    def __init__(self, settings):
        self.settings = settings
        self._mock = bool(settings.use_mock_models)
        self._model = None
        self._names: Dict[int, str] = {}
        self._model_path_used: Optional[str] = None
        if not self._mock:
            self._load()

    # ── model management ────────────────────────────────────────────
    def _load(self) -> None:
        from ultralytics import YOLO  # lazy: pulls in torch

        path = self.settings.yolo_model_path
        if not os.path.isfile(path):
            logger.warning(
                "Custom YOLO weights %s not found, falling back to %s",
                path, self.settings.yolo_fallback_model,
            )
            path = self.settings.yolo_fallback_model
        self._model = YOLO(path)
        self._names = {int(k): str(v) for k, v in self._model.names.items()}
        self._model_path_used = path
        logger.info("YOLO loaded: %s (classes: %s)", path, list(self._names.values()))

    @property
    def model_loaded(self) -> bool:
        return self._mock or self._model is not None

    @staticmethod
    def _canonical(raw_name: str) -> Optional[str]:
        return _NAME_MAP.get(raw_name.strip().lower())

    # ── inference ───────────────────────────────────────────────────
    def detect_frames(self, frames: Sequence[ExtractedFrame]) -> List[FrameDetections]:
        if self._mock:
            return [self._mock_detect(frame) for frame in frames]
        if self._model is None:
            raise RuntimeError("YOLO model is not loaded")

        results: List[FrameDetections] = []
        conf_threshold = float(self.settings.yolo_confidence)
        device = self.settings.resolved_device
        for frame in frames:
            preds = self._model.predict(
                source=frame.path,
                conf=conf_threshold,
                device=device,
                verbose=False,
            )
            detections: List[Detection] = []
            for result in preds:
                boxes = result.boxes
                if boxes is None:
                    continue
                for i in range(len(boxes)):
                    raw_name = self._names.get(int(boxes.cls[i].item()), "")
                    canonical = self._canonical(raw_name)
                    if canonical is None:
                        continue  # class not relevant to the register scene
                    detections.append(
                        Detection(
                            class_name=canonical,
                            confidence=float(boxes.conf[i].item()),
                            bbox=[float(v) for v in boxes.xyxy[i].tolist()],
                        )
                    )
            results.append(FrameDetections(frame=frame, detections=detections))
        return results

    def build_events(
        self, frame_detections: Sequence[FrameDetections]
    ) -> List[CashEvent]:
        return group_events(
            frame_detections,
            gap_tolerance_s=float(self.settings.event_gap_tolerance_s),
            min_cash_confidence=float(self.settings.min_event_confidence),
        )

    # ── deterministic mock (dev/tests) ──────────────────────────────
    def _mock_detect(self, frame: ExtractedFrame) -> FrameDetections:
        """Heuristic detections derived from the frame's activity score."""
        active = frame.activity_score >= float(self.settings.activity_threshold)
        detections = [
            Detection("person", 0.90, [10.0, 5.0, 200.0, 400.0]),
            Detection("pos_screen", 0.60, [220.0, 30.0, 420.0, 200.0]),
        ]
        if active:
            cash_conf = min(0.95, 0.5 + frame.activity_score / 100.0)
            detections.extend(
                [
                    Detection("hand", 0.80, [230.0, 210.0, 320.0, 300.0]),
                    Detection("cash", cash_conf, [250.0, 230.0, 340.0, 310.0]),
                    Detection("cash_drawer", 0.70, [200.0, 250.0, 460.0, 360.0]),
                ]
            )
        return FrameDetections(frame=frame, detections=detections)
