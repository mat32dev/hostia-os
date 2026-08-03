"""Local 24h rolling video buffer.

Video segments are written to disk by :mod:`src.camera` and registered here.
This module owns retention: segments older than ``retention_hours`` are
removed once uploaded, and total disk usage is capped — unsynced footage is
sacrificed last (oldest-uploaded-first eviction).
"""

from __future__ import annotations

import logging
import os
import threading
from pathlib import Path

from .config import Settings
from .db import Database
from .models import VideoSegment, new_id, utcnow

log = logging.getLogger(__name__)


class VideoBuffer:
    def __init__(self, cfg: Settings, db: Database):
        self.cfg = cfg
        self.db = db
        self.video_dir = cfg.video_dir
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    # ─── Segment registration ─────────────────────────────────────────
    def add_segment(
        self,
        path: str | Path,
        started_at: float,
        ended_at: float,
        size_bytes: int | None = None,
    ) -> VideoSegment:
        """Register a finished video segment on disk into the index."""
        path = str(path)
        if size_bytes is None:
            try:
                size_bytes = os.path.getsize(path)
            except OSError:
                size_bytes = 0
        seg = VideoSegment(
            id=new_id(),
            path=path,
            started_at=started_at,
            ended_at=ended_at,
            duration_sec=max(0.0, ended_at - started_at),
            size_bytes=size_bytes,
        )
        self.db.execute(
            """INSERT INTO videos
               (id, path, started_at, ended_at, duration_sec, size_bytes,
                uploaded, uploaded_at, created_at)
               VALUES (?,?,?,?,?,?,0,NULL,?)""",
            (
                seg.id, seg.path, seg.started_at, seg.ended_at,
                seg.duration_sec, seg.size_bytes, seg.created_at,
            ),
        )
        log.debug(
            "Buffered segment %s (%d bytes, %.0fs)",
            seg.id, seg.size_bytes, seg.duration_sec,
        )
        return seg

    # ─── Queries ──────────────────────────────────────────────────────
    def get(self, segment_id: str) -> VideoSegment | None:
        row = self.db.query_one("SELECT * FROM videos WHERE id = ?", (segment_id,))
        return VideoSegment.from_row(row) if row else None

    def pending_uploads(self, limit: int = 10) -> list[VideoSegment]:
        rows = self.db.query(
            """SELECT * FROM videos
               WHERE uploaded = 0 AND ended_at IS NOT NULL
               ORDER BY started_at ASC LIMIT ?""",
            (limit,),
        )
        return [VideoSegment.from_row(r) for r in rows]

    def mark_uploaded(self, segment_id: str) -> None:
        self.db.execute(
            "UPDATE videos SET uploaded = 1, uploaded_at = ? WHERE id = ?",
            (utcnow(), segment_id),
        )

    def stats(self) -> dict:
        row = self.db.query_one(
            """SELECT COUNT(*) AS n,
                      COALESCE(SUM(size_bytes), 0) AS bytes,
                      COALESCE(SUM(CASE WHEN uploaded = 0 THEN 1 ELSE 0 END), 0) AS pending,
                      MIN(started_at) AS oldest
               FROM videos"""
        )
        return {
            "segments": row["n"],
            "bytes": row["bytes"],
            "pending_uploads": row["pending"],
            "oldest_segment_at": row["oldest"],
        }

    # ─── Retention ────────────────────────────────────────────────────
    def prune(self, now: float | None = None) -> dict:
        """Apply retention policy. Returns a summary of what was deleted."""
        now = now if now is not None else utcnow()
        cutoff = now - self.cfg.retention_hours * 3600
        deleted_expired = 0
        deleted_cap = 0

        # 1. Drop expired segments that already reached the cloud.
        expired = self.db.query(
            "SELECT * FROM videos WHERE uploaded = 1 AND started_at < ? "
            "ORDER BY started_at ASC",
            (cutoff,),
        )
        for row in expired:
            if self._delete(row):
                deleted_expired += 1

        # 2. Enforce the disk cap. Uploaded segments go first; unsynced
        #    footage is only dropped when there is no other way to stay
        #    under the cap (never the newest segment — it may be recording).
        total = self.stats()["bytes"]
        if total > self.cfg.max_storage_bytes:
            candidates = self.db.query(
                """SELECT * FROM videos
                   WHERE id NOT IN (SELECT id FROM videos ORDER BY started_at DESC LIMIT 1)
                   ORDER BY uploaded DESC, started_at ASC"""
            )
            for row in candidates:
                if total <= self.cfg.max_storage_bytes:
                    break
                size = row["size_bytes"] or 0
                if not row["uploaded"]:
                    log.warning(
                        "Disk cap reached: dropping unsynced segment %s", row["id"]
                    )
                if self._delete(row):
                    total -= size
                    deleted_cap += 1

        if deleted_expired or deleted_cap:
            log.info(
                "Prune: removed %d expired, %d for disk cap (%.1f MB in use)",
                deleted_expired, deleted_cap, self.stats()["bytes"] / 1e6,
            )
        return {"expired": deleted_expired, "disk_cap": deleted_cap}

    def _delete(self, row) -> bool:
        seg = VideoSegment.from_row(row)
        try:
            os.remove(seg.path)
        except FileNotFoundError:
            pass
        except OSError as exc:
            log.error("Cannot delete %s: %s", seg.path, exc)
            return False
        self.db.execute("DELETE FROM videos WHERE id = ?", (seg.id,))
        return True

    # ─── Janitor loop ─────────────────────────────────────────────────
    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(
            target=self._janitor, name="buffer-janitor", daemon=True
        )
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=10)

    def _janitor(self) -> None:
        while not self._stop.wait(self.cfg.prune_interval):
            try:
                self.prune()
            except Exception:
                log.exception("Buffer prune failed")
