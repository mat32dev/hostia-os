"""Tests for the 24h rolling video buffer."""

import os
import time

import pytest

from src.buffer import VideoBuffer
from src.config import Settings
from src.db import Database


@pytest.fixture()
def env(tmp_path):
    cfg = Settings(
        device_id="test-device",
        data_dir=tmp_path,
        retention_hours=24,
        max_storage_gb=1.0,
    )
    cfg.ensure_dirs()
    db = Database(cfg.db_path)
    buffer = VideoBuffer(cfg, db)
    return cfg, db, buffer


def make_segment(buffer, tmp_path, started_at, size=1024, name=None):
    """Create a real file on disk and register it in the buffer."""
    name = name or f"seg_{int(started_at * 1000)}.mp4"
    path = tmp_path / "videos" / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(b"\0" * size)
    return buffer.add_segment(path, started_at, started_at + 60, size_bytes=size)


class TestAddSegment:
    def test_registers_segment(self, env, tmp_path):
        cfg, db, buffer = env
        now = time.time()
        seg = make_segment(buffer, tmp_path, now, size=2048)

        assert seg.size_bytes == 2048
        assert seg.duration_sec == pytest.approx(60.0)
        stored = buffer.get(seg.id)
        assert stored is not None
        assert stored.uploaded is False

    def test_stats_reflect_segments(self, env, tmp_path):
        cfg, db, buffer = env
        now = time.time()
        make_segment(buffer, tmp_path, now - 120, size=1000)
        make_segment(buffer, tmp_path, now - 60, size=2000)

        stats = buffer.stats()
        assert stats["segments"] == 2
        assert stats["bytes"] == 3000
        assert stats["pending_uploads"] == 2


class TestUploadTracking:
    def test_pending_and_mark_uploaded(self, env, tmp_path):
        cfg, db, buffer = env
        now = time.time()
        s1 = make_segment(buffer, tmp_path, now - 120)
        s2 = make_segment(buffer, tmp_path, now - 60)

        pending = buffer.pending_uploads()
        assert [s.id for s in pending] == [s1.id, s2.id]  # oldest first

        buffer.mark_uploaded(s1.id)
        pending = buffer.pending_uploads()
        assert [s.id for s in pending] == [s2.id]
        assert buffer.get(s1.id).uploaded is True
        assert buffer.stats()["pending_uploads"] == 1


class TestRetention:
    def test_prune_deletes_expired_uploaded(self, env, tmp_path):
        cfg, db, buffer = env
        now = time.time()
        old = make_segment(buffer, tmp_path, now - 25 * 3600)
        buffer.mark_uploaded(old.id)
        recent = make_segment(buffer, tmp_path, now - 3600)
        buffer.mark_uploaded(recent.id)

        result = buffer.prune(now=now)

        assert result["expired"] == 1
        assert buffer.get(old.id) is None
        assert not os.path.exists(old.path)
        assert buffer.get(recent.id) is not None
        assert os.path.exists(recent.path)

    def test_prune_keeps_expired_unsynced(self, env, tmp_path):
        """Unsynced footage survives retention — it must reach the cloud."""
        cfg, db, buffer = env
        now = time.time()
        old = make_segment(buffer, tmp_path, now - 48 * 3600)

        result = buffer.prune(now=now)

        assert result["expired"] == 0
        assert buffer.get(old.id) is not None
        assert os.path.exists(old.path)


class TestDiskCap:
    def test_cap_evicts_oldest_uploaded_first(self, env, tmp_path):
        cfg, db, buffer = env
        cfg.max_storage_gb = 0  # force the cap to zero bytes
        now = time.time()
        s1 = make_segment(buffer, tmp_path, now - 400, size=500)
        s2 = make_segment(buffer, tmp_path, now - 300, size=500)
        s3 = make_segment(buffer, tmp_path, now - 200, size=500)
        buffer.mark_uploaded(s1.id)
        # s2 deliberately left unsynced, s3 newest (possibly recording)

        buffer.prune(now=now)

        # Uploaded oldest evicted even though s2 is older in the queue?
        assert buffer.get(s1.id) is None, "oldest uploaded must be evicted"
        # Newest segment is protected (may be actively recording).
        assert buffer.get(s3.id) is not None

    def test_cap_drops_unsynced_only_as_last_resort(self, env, tmp_path):
        cfg, db, buffer = env
        cfg.max_storage_gb = 0
        now = time.time()
        s1 = make_segment(buffer, tmp_path, now - 400, size=500)
        s2 = make_segment(buffer, tmp_path, now - 300, size=500)
        # nothing uploaded; s2 is the newest (protected)

        buffer.prune(now=now)

        assert buffer.get(s1.id) is None, "oldest unsynced dropped under pressure"
        assert buffer.get(s2.id) is not None, "newest segment never pruned"

    def test_prune_is_idempotent(self, env, tmp_path):
        cfg, db, buffer = env
        now = time.time()
        old = make_segment(buffer, tmp_path, now - 48 * 3600)
        buffer.mark_uploaded(old.id)

        first = buffer.prune(now=now)
        second = buffer.prune(now=now)

        assert first["expired"] == 1
        assert second == {"expired": 0, "disk_cap": 0}
