"""Camera capture for USB webcams and RTSP/IP cameras.

Frames are read sequentially (no in-memory queue — the 512MB budget rules
out frame buffering) and written to fixed-length MP4 segments on disk. Each
finished segment is handed to the video buffer. RTSP sources reconnect with
exponential backoff; a dead camera never kills the agent.
"""

from __future__ import annotations

import logging
import threading
import time
from pathlib import Path
from typing import Any, Callable

from .config import Settings

log = logging.getLogger(__name__)

try:
    import cv2
except ImportError:  # headless CI / dev machines without OpenCV
    cv2 = None  # type: ignore[assignment]

SegmentCallback = Callable[[Path, float, float], None]
FrameCallback = Callable[[Any], None]


class CameraCapture:
    def __init__(
        self,
        cfg: Settings,
        on_segment: SegmentCallback,
        on_frame: FrameCallback | None = None,
    ):
        self.cfg = cfg
        self.on_segment = on_segment
        self.on_frame = on_frame
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._lock = threading.Lock()
        self._opened = False
        self._last_frame_at = 0.0
        self._frames_written = 0
        self._restarts = 0
        self._current_segment: Path | None = None

    # ─── Lifecycle ────────────────────────────────────────────────────
    def start(self) -> None:
        if cv2 is None:
            log.error("OpenCV is not installed; camera capture disabled")
            return
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(
            target=self._run, name="camera-capture", daemon=True
        )
        self._thread.start()
        log.info("Camera capture started (source=%s)", self.cfg.camera_source)

    def stop(self) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=15)
        log.info("Camera capture stopped")

    # ─── Main loop ────────────────────────────────────────────────────
    def _run(self) -> None:
        backoff = self.cfg.camera_reconnect_seconds
        while not self._stop.is_set():
            cap = self._open()
            if cap is None:
                self._stop.wait(backoff)
                backoff = min(backoff * 2, 300)
                continue
            backoff = self.cfg.camera_reconnect_seconds
            try:
                self._capture_loop(cap)
            except Exception:
                log.exception("Camera loop crashed; restarting")
            finally:
                cap.release()
                with self._lock:
                    self._opened = False
                self._restarts += 1

    def _open(self):
        source = self.cfg.camera_source
        if isinstance(source, str) and source.startswith(("rtsp://", "http")):
            cap = cv2.VideoCapture(source, cv2.CAP_FFMPEG)
        else:
            cap = cv2.VideoCapture(int(source))
        if not cap.isOpened():
            log.warning("Cannot open camera source %r; retrying", source)
            cap.release()
            return None
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.cfg.camera_width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.cfg.camera_height)
        cap.set(cv2.CAP_PROP_FPS, self.cfg.camera_fps)
        with self._lock:
            self._opened = True
        return cap

    def _capture_loop(self, cap) -> None:
        writer = None
        seg_start = 0.0
        frame_interval = 1.0 / max(1, self.cfg.camera_fps)
        last_write = 0.0
        frame_count = 0
        read_failures = 0

        while not self._stop.is_set():
            ok, frame = cap.read()
            if not ok or frame is None:
                read_failures += 1
                if read_failures >= 30:
                    log.warning("Camera stalled (30 failed reads); reconnecting")
                    break
                time.sleep(0.1)
                continue
            read_failures = 0
            now = time.time()

            with self._lock:
                self._last_frame_at = now

            # Rotate segment.
            if writer is None or (now - seg_start) >= self.cfg.segment_seconds:
                if writer is not None:
                    writer.release()
                    self._emit_segment(self._current_segment, seg_start, now)
                self._current_segment = self._segment_path(now)
                writer = self._new_writer(self._current_segment, frame)
                if writer is None:
                    time.sleep(1)
                    continue
                seg_start = now

            # Frame pacing: honor target fps even if the source delivers more.
            if now - last_write >= frame_interval:
                writer.write(frame)
                last_write = now
                with self._lock:
                    self._frames_written += 1

            # Optional local analysis (motion detection) on sampled frames.
            if self.on_frame is not None:
                frame_count += 1
                if frame_count % max(1, self.cfg.motion_frame_skip) == 0:
                    try:
                        self.on_frame(frame)
                    except Exception:
                        log.exception("Frame analysis callback failed")

        if writer is not None:
            writer.release()
            self._emit_segment(self._current_segment, seg_start, time.time())

    def _new_writer(self, path: Path, frame):
        height, width = frame.shape[:2]
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(
            str(path), fourcc, float(self.cfg.camera_fps), (width, height)
        )
        if not writer.isOpened():
            log.error("Cannot create video writer for %s", path)
            writer.release()
            return None
        return writer

    def _segment_path(self, ts: float) -> Path:
        day = time.strftime("%Y-%m-%d", time.localtime(ts))
        day_dir = self.cfg.video_dir / day
        day_dir.mkdir(parents=True, exist_ok=True)
        stamp = time.strftime("%H%M%S", time.localtime(ts))
        return day_dir / f"{self.cfg.device_id}_{int(ts)}_{stamp}.mp4"

    def _emit_segment(self, path: Path | None, started_at: float, ended_at: float) -> None:
        if path is None:
            return
        try:
            self.on_segment(path, started_at, ended_at)
        except Exception:
            log.exception("Segment callback failed for %s", path)

    # ─── Health ───────────────────────────────────────────────────────
    def status(self) -> dict:
        with self._lock:
            age = time.time() - self._last_frame_at if self._last_frame_at else None
            return {
                "enabled": self.cfg.camera_enabled,
                "available": cv2 is not None,
                "opened": self._opened,
                "last_frame_age_sec": round(age, 1) if age is not None else None,
                "frames_written": self._frames_written,
                "restarts": self._restarts,
                "healthy": self._opened and (age is not None and age < 10),
            }
