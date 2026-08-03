"""FFmpeg-based frame extraction with activity detection.

Frames are decoded with FFmpeg at a fixed sampling rate, then scored for
activity (mean absolute pixel difference against the previous sampled frame).
Static frames — an empty bar, a still register — are skipped so downstream
detection/VLM stages only run on frames where something actually happens.
"""

import logging
import os
import shutil
import subprocess
import tempfile
from dataclasses import dataclass, field
from typing import List, Optional, Sequence

logger = logging.getLogger(__name__)


@dataclass
class ExtractedFrame:
    index: int
    timestamp_s: float
    path: str
    activity_score: float = 0.0


@dataclass
class ExtractionResult:
    frames: List[ExtractedFrame] = field(default_factory=list)
    duration_s: float = 0.0
    fps: float = 0.0
    work_dir: str = ""
    total_sampled: int = 0


def select_active_frames(
    scores: Sequence[float],
    threshold: float,
    padding: int = 1,
    max_frames: Optional[int] = None,
) -> List[int]:
    """Pure activity filter: return indices of frames worth keeping.

    - The first frame is always kept (baseline scene context).
    - A frame scoring >= ``threshold`` is kept together with ``padding``
      neighbours on each side (event context).
    - If more than ``max_frames`` survive, the highest-activity ones win
      (the first frame is still always kept).
    """
    n = len(scores)
    if n == 0:
        return []
    keep = {0}
    for i, score in enumerate(scores):
        if score >= threshold:
            for j in range(max(0, i - padding), min(n, i + padding + 1)):
                keep.add(j)
    selected = sorted(keep)
    if max_frames and len(selected) > max_frames:
        ranked = sorted(selected, key=lambda i: scores[i], reverse=True)
        chosen = set(ranked[:max_frames])
        chosen.add(selected[0])
        selected = sorted(chosen)
    return selected


class FrameExtractor:
    """Extracts activity-filtered frames from a video file using FFmpeg."""

    def __init__(self, settings):
        self.settings = settings

    # ── ffmpeg helpers ──────────────────────────────────────────────
    @staticmethod
    def _require_binary(name: str) -> str:
        path = shutil.which(name)
        if not path:
            raise RuntimeError(
                f"{name} is not installed or not on PATH. "
                "Install ffmpeg (e.g. `apt-get install ffmpeg`)."
            )
        return path

    def probe_duration(self, video_path: str) -> float:
        """Return the video duration in seconds using ffprobe."""
        ffprobe = self._require_binary("ffprobe")
        proc = subprocess.run(
            [
                ffprobe, "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                video_path,
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        try:
            return max(0.0, float(proc.stdout.strip()))
        except ValueError:
            logger.warning("ffprobe could not parse duration for %s", video_path)
            return 0.0

    # ── main API ────────────────────────────────────────────────────
    def extract(
        self, video_path: str, work_dir: Optional[str] = None
    ) -> ExtractionResult:
        """Decode frames with FFmpeg and keep only frames with activity."""
        if not os.path.isfile(video_path):
            raise FileNotFoundError(f"Video not found: {video_path}")
        ffmpeg = self._require_binary("ffmpeg")

        fps = float(self.settings.frame_extraction_fps)
        duration_s = self.probe_duration(video_path)
        own_dir = work_dir is None
        work_dir = work_dir or tempfile.mkdtemp(prefix="guard_frames_")
        frames_dir = os.path.join(work_dir, "sampled")
        os.makedirs(frames_dir, exist_ok=True)

        pattern = os.path.join(frames_dir, "%06d.jpg")
        proc = subprocess.run(
            [
                ffmpeg, "-hide_banner", "-loglevel", "error",
                "-i", video_path,
                "-vf", f"fps={fps}",
                "-q:v", "3",
                pattern,
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        if proc.returncode != 0:
            if own_dir:
                shutil.rmtree(work_dir, ignore_errors=True)
            raise RuntimeError(f"ffmpeg frame extraction failed: {proc.stderr.strip()}")

        sampled_files = sorted(f for f in os.listdir(frames_dir) if f.endswith(".jpg"))
        if not sampled_files:
            if own_dir:
                shutil.rmtree(work_dir, ignore_errors=True)
            raise RuntimeError(
                f"ffmpeg produced no frames for {video_path} (corrupt video?)"
            )

        paths = [os.path.join(frames_dir, f) for f in sampled_files]
        scores = self._activity_scores(paths)
        keep = select_active_frames(
            scores,
            threshold=float(self.settings.activity_threshold),
            padding=int(self.settings.activity_padding),
            max_frames=int(self.settings.max_frames_per_video),
        )
        keep_set = set(keep)

        frames: List[ExtractedFrame] = []
        for i, path in enumerate(paths):
            if i in keep_set:
                frames.append(
                    ExtractedFrame(
                        index=i,
                        timestamp_s=round(i / fps, 3),
                        path=path,
                        activity_score=round(float(scores[i]), 3),
                    )
                )
            else:
                os.unlink(path)  # drop static frames from disk

        logger.info(
            "extract: kept %d/%d sampled frames (%.1fs video)",
            len(frames), len(paths), duration_s,
        )
        return ExtractionResult(
            frames=frames,
            duration_s=duration_s,
            fps=fps,
            work_dir=work_dir,
            total_sampled=len(paths),
        )

    # ── activity scoring ────────────────────────────────────────────
    @staticmethod
    def _activity_scores(paths: List[str]) -> List[float]:
        """Mean abs pixel diff between consecutive frames (0-255 scale).

        OpenCV is imported lazily so this module stays importable in
        environments without cv2 (e.g. API-only containers or test runs).
        """
        try:
            import cv2
            import numpy as np
        except ImportError as exc:  # pragma: no cover - depends on environment
            raise RuntimeError(
                "opencv-python-headless and numpy are required for frame "
                "activity scoring."
            ) from exc

        scores: List[float] = [0.0]
        prev = None
        for path in paths:
            img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
            if img is None:
                scores.append(0.0)
                continue
            img = cv2.resize(img, (320, 240), interpolation=cv2.INTER_AREA)
            if prev is not None:
                diff = cv2.absdiff(img, prev)
                scores.append(float(np.mean(diff)))
            prev = img
        # scores has one entry per frame (first frame = 0.0 baseline)
        return scores[: len(paths)]

    @staticmethod
    def cleanup(result: ExtractionResult) -> None:
        """Remove the extraction working directory."""
        if result.work_dir and os.path.isdir(result.work_dir):
            shutil.rmtree(result.work_dir, ignore_errors=True)
