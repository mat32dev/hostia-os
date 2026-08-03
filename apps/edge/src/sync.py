"""Cloud synchronization.

Pushes queued events (orders, motion alerts) and buffered video segments to
the HosT.ia cloud, and pulls remote configuration. Designed for hostile
bar-grade connectivity: every failure is retried with exponential backoff
and the agent keeps working locally while the cloud is unreachable.
"""

from __future__ import annotations

import json
import logging
import threading
import time
from pathlib import Path

import requests

from .buffer import VideoBuffer
from .config import Settings
from .db import Database
from .models import SyncEvent, utcnow

log = logging.getLogger(__name__)


def _backoff(attempts: int) -> float:
    return min(300.0, 5.0 * (2 ** min(attempts, 6)))


class CloudSync:
    def __init__(
        self,
        cfg: Settings,
        db: Database,
        buffer: VideoBuffer,
        session: requests.Session | None = None,
    ):
        self.cfg = cfg
        self.db = db
        self.buffer = buffer
        self.session = session or requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {cfg.device_token}",
                "X-Device-Id": cfg.device_id,
                "User-Agent": f"hostia-edge/{cfg.version}",
            }
        )
        self.online = False
        self.last_online_at: float | None = None
        self.last_error = ""
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    # ─── Endpoints ────────────────────────────────────────────────────
    def _url(self, path: str) -> str:
        return f"{self.cfg.cloud_api}/v1/edge/{self.cfg.device_id}{path}"

    # ─── Queue management ─────────────────────────────────────────────
    def enqueue(self, kind: str, payload: dict, ref_id: str = "") -> int:
        cur = self.db.execute(
            """INSERT INTO sync_queue (kind, payload, ref_id, attempts,
                                       next_retry_at, last_error, created_at)
               VALUES (?,?,?,0,0,'',?)""",
            (kind, json.dumps(payload), ref_id, utcnow()),
        )
        return int(cur.lastrowid)

    def due_events(self, limit: int | None = None) -> list[SyncEvent]:
        limit = limit or self.cfg.sync_batch_size
        rows = self.db.query(
            """SELECT * FROM sync_queue
               WHERE next_retry_at <= ?
               ORDER BY id ASC LIMIT ?""",
            (utcnow(), limit),
        )
        return [SyncEvent.from_row(r) for r in rows]

    def queue_depth(self) -> int:
        return int(self.db.scalar("SELECT COUNT(*) FROM sync_queue", default=0))

    # ─── Push events ──────────────────────────────────────────────────
    def push_events(self) -> int:
        """Push due queue events in one batch. Returns acked count."""
        events = self.due_events()
        if not events:
            return 0
        body = {"events": [e.to_wire() for e in events]}
        try:
            resp = self.session.post(
                self._url("/events"), json=body, timeout=self.cfg.request_timeout
            )
            resp.raise_for_status()
        except requests.RequestException as exc:
            self._note_failure(events, exc)
            return 0

        self._note_success()
        now = utcnow()
        with self.db.transaction() as conn:
            for event in events:
                conn.execute("DELETE FROM sync_queue WHERE id = ?", (event.id,))
                if event.kind.startswith("order.") and event.ref_id:
                    conn.execute(
                        "UPDATE orders SET synced = 1, updated_at = ? WHERE id = ?",
                        (now, event.ref_id),
                    )
        log.info("Synced %d events to cloud", len(events))
        return len(events)

    def _note_failure(self, events: list[SyncEvent], exc: Exception) -> None:
        self.online = False
        self.last_error = str(exc)
        log.warning("Event push failed (%d events): %s", len(events), exc)
        now = utcnow()
        with self.db.transaction() as conn:
            for event in events:
                attempts = event.attempts + 1
                conn.execute(
                    """UPDATE sync_queue
                       SET attempts = ?, next_retry_at = ?, last_error = ?
                       WHERE id = ?""",
                    (attempts, now + _backoff(attempts), str(exc)[:500], event.id),
                )

    def _note_success(self) -> None:
        self.online = True
        self.last_online_at = utcnow()
        self.last_error = ""

    # ─── Upload videos ────────────────────────────────────────────────
    def upload_videos(self, per_cycle: int = 2) -> int:
        """Upload a few pending segments per cycle (be kind to bar Wi-Fi)."""
        uploaded = 0
        for seg in self.buffer.pending_uploads(limit=per_cycle):
            path = Path(seg.path)
            if not path.exists():
                log.warning("Segment file missing, marking uploaded: %s", seg.path)
                self.buffer.mark_uploaded(seg.id)
                continue
            try:
                with open(path, "rb") as fh:
                    resp = self.session.post(
                        self._url("/videos"),
                        data=seg.to_payload(),
                        files={"file": (path.name, fh, "video/mp4")},
                        timeout=max(self.cfg.request_timeout, 120),
                    )
                resp.raise_for_status()
            except requests.RequestException as exc:
                self.online = False
                self.last_error = str(exc)
                log.warning("Video upload failed (%s): %s", seg.id, exc)
                break  # try again next cycle
            self.buffer.mark_uploaded(seg.id)
            self._note_success()
            uploaded += 1
            log.info("Uploaded segment %s (%d bytes)", seg.id, seg.size_bytes)
        return uploaded

    # ─── Pull remote config ───────────────────────────────────────────
    def pull_config(self) -> list[str]:
        """Fetch remote configuration overrides and apply them."""
        try:
            resp = self.session.get(
                self._url("/config"), timeout=self.cfg.request_timeout
            )
            if resp.status_code == 404:
                self._note_success()
                return []
            resp.raise_for_status()
            data = resp.json()
        except (requests.RequestException, ValueError) as exc:
            self.online = False
            self.last_error = str(exc)
            log.warning("Config pull failed: %s", exc)
            return []

        self._note_success()
        overrides = data.get("overrides") or {}
        if not isinstance(overrides, dict):
            log.warning("Malformed config payload: %r", data)
            return []
        applied = self.cfg.apply_remote(overrides)
        self.db.execute(
            "INSERT INTO kv_state (key, value) VALUES ('remote_config', ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (json.dumps(overrides),),
        )
        return applied

    # ─── Worker loop ──────────────────────────────────────────────────
    def sync_once(self) -> dict:
        pushed = self.push_events()
        uploaded = self.upload_videos()
        applied = self.pull_config()
        return {"events": pushed, "videos": uploaded, "config_keys": applied}

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(
            target=self._run, name="cloud-sync", daemon=True
        )
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=10)

    def _run(self) -> None:
        while not self._stop.is_set():
            try:
                self.sync_once()
            except Exception:
                log.exception("Sync cycle failed")
            # Offline? Back off instead of hammering a dead link.
            wait = self.cfg.sync_interval if self.online else max(
                self.cfg.sync_interval, 60
            )
            self._stop.wait(wait)

    # ─── Health ───────────────────────────────────────────────────────
    def status(self) -> dict:
        return {
            "online": self.online,
            "last_online_at": self.last_online_at,
            "last_error": self.last_error,
            "queue_depth": self.queue_depth(),
        }
