"""Heartbeat: periodic health + status report to the cloud.

Sends a compact payload every ``heartbeat_interval`` seconds (remotely
tunable). The heartbeat is also the cloud's liveness signal for the
fleet dashboard — it must keep trying forever and never raise.
"""

from __future__ import annotations

import logging
import os
import shutil
import threading
import time

import requests

from .buffer import VideoBuffer
from .camera import CameraCapture
from .config import Settings
from .sync import CloudSync

log = logging.getLogger(__name__)


def _memory_info() -> dict:
    """Read /proc/meminfo (Linux). Returns zeros elsewhere."""
    try:
        info: dict[str, int] = {}
        with open("/proc/meminfo") as fh:
            for line in fh:
                parts = line.split()
                if len(parts) >= 2 and parts[0] in ("MemTotal:", "MemAvailable:"):
                    info[parts[0].rstrip(":")] = int(parts[1]) * 1024
        total = info.get("MemTotal", 0)
        available = info.get("MemAvailable", 0)
        return {"total": total, "used": max(0, total - available)}
    except OSError:
        return {"total": 0, "used": 0}


class Heartbeat:
    def __init__(
        self,
        cfg: Settings,
        buffer: VideoBuffer,
        sync: CloudSync,
        camera: CameraCapture | None = None,
        session: requests.Session | None = None,
        started_at: float | None = None,
    ):
        self.cfg = cfg
        self.buffer = buffer
        self.sync = sync
        self.camera = camera
        self.session = session or requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {cfg.device_token}",
                "X-Device-Id": cfg.device_id,
                "User-Agent": f"hostia-edge/{cfg.version}",
            }
        )
        self.started_at = started_at or time.time()
        self.last_ack_at: float | None = None
        self.consecutive_failures = 0
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    # ─── Payload ──────────────────────────────────────────────────────
    def collect(self) -> dict:
        disk = shutil.disk_usage(self.cfg.video_dir)
        payload = {
            "device_id": self.cfg.device_id,
            "version": self.cfg.version,
            "sent_at": time.time(),
            "uptime_sec": int(time.time() - self.started_at),
            "config": self.cfg.snapshot(),
            "buffer": self.buffer.stats(),
            "sync": self.sync.status(),
            "camera": self.camera.status() if self.camera else {"enabled": False},
            "disk": {"total": disk.total, "used": disk.used, "free": disk.free},
            "memory": _memory_info(),
            "load_avg": os.getloadavg()[0] if hasattr(os, "getloadavg") else None,
        }
        return payload

    def send(self) -> bool:
        url = f"{self.cfg.cloud_api}/v1/edge/{self.cfg.device_id}/heartbeat"
        try:
            resp = self.session.post(
                url, json=self.collect(), timeout=self.cfg.request_timeout
            )
            resp.raise_for_status()
        except requests.RequestException as exc:
            self.consecutive_failures += 1
            log.warning(
                "Heartbeat failed (%d in a row): %s",
                self.consecutive_failures, exc,
            )
            return False
        self.consecutive_failures = 0
        self.last_ack_at = time.time()
        log.debug("Heartbeat ack")
        return True

    # ─── Loop ─────────────────────────────────────────────────────────
    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(
            target=self._run, name="heartbeat", daemon=True
        )
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=10)

    def _run(self) -> None:
        while not self._stop.is_set():
            try:
                self.send()
            except Exception:
                log.exception("Heartbeat cycle failed")
            self._stop.wait(self.cfg.heartbeat_interval)

    def status(self) -> dict:
        return {
            "last_ack_at": self.last_ack_at,
            "consecutive_failures": self.consecutive_failures,
            "interval": self.cfg.heartbeat_interval,
        }
