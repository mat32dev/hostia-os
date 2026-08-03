"""Tests for cloud synchronization: event queue, retries, video upload,
and remote config. All HTTP is faked — no network involved."""

import time

import pytest
import requests

from src.buffer import VideoBuffer
from src.config import Settings
from src.db import Database
from src.sync import CloudSync


# ─── Fakes ──────────────────────────────────────────────────────────────────
class FakeResponse:
    def __init__(self, status_code=200, payload=None):
        self.status_code = status_code
        self._payload = payload or {}

    def json(self):
        return self._payload

    def raise_for_status(self):
        if self.status_code >= 400:
            raise requests.HTTPError(f"HTTP {self.status_code}", response=self)


class FakeSession:
    """Records calls and replays scripted responses/exceptions."""

    def __init__(self):
        self.headers = {}
        self.posts = []
        self.gets = []
        self._post_script = []
        self._get_script = []

    def script_post(self, *items):
        self._post_script = list(items)

    def script_get(self, *items):
        self._get_script = list(items)

    def post(self, url, **kwargs):
        self.posts.append((url, kwargs))
        item = self._post_script.pop(0) if self._post_script else FakeResponse()
        if isinstance(item, Exception):
            raise item
        return item

    def get(self, url, **kwargs):
        self.gets.append((url, kwargs))
        item = self._get_script.pop(0) if self._get_script else FakeResponse()
        if isinstance(item, Exception):
            raise item
        return item


# ─── Fixtures ───────────────────────────────────────────────────────────────
@pytest.fixture()
def env(tmp_path):
    cfg = Settings(
        device_id="dev-1",
        device_token="tok",
        cloud_api="https://cloud.test",
        data_dir=tmp_path,
        sync_batch_size=50,
    )
    cfg.ensure_dirs()
    db = Database(cfg.db_path)
    buffer = VideoBuffer(cfg, db)
    session = FakeSession()
    sync = CloudSync(cfg, db, buffer, session=session)
    return cfg, db, buffer, session, sync


class TestEventPush:
    def test_push_success_acks_and_marks_order_synced(self, env):
        cfg, db, buffer, session, sync = env
        db.execute(
            """INSERT INTO orders
               (id, table_number, items, total_cents, status, note,
                synced, created_at, updated_at)
               VALUES ('o1', '4', '[]', 1200, 'open', '', 0, 1, 1)"""
        )
        sync.enqueue("order.created", {"id": "o1"}, ref_id="o1")
        session.script_post(FakeResponse(200))

        assert sync.push_events() == 1
        assert sync.queue_depth() == 0
        assert db.scalar("SELECT synced FROM orders WHERE id = 'o1'") == 1
        assert sync.online is True

        url, kwargs = session.posts[0]
        assert url == "https://cloud.test/v1/edge/dev-1/events"
        assert kwargs["json"]["events"][0]["kind"] == "order.created"

    def test_push_failure_schedules_retry_with_backoff(self, env):
        cfg, db, buffer, session, sync = env
        sync.enqueue("order.created", {"id": "o1"}, ref_id="o1")
        session.script_post(requests.ConnectionError("dns failed"))

        assert sync.push_events() == 0
        assert sync.queue_depth() == 1
        assert sync.online is False
        assert "dns failed" in sync.last_error

        row = db.query_one("SELECT * FROM sync_queue")
        assert row["attempts"] == 1
        assert row["next_retry_at"] > time.time()

    def test_failed_event_not_retried_until_backoff_expires(self, env):
        cfg, db, buffer, session, sync = env
        sync.enqueue("motion.detected", {"score": 9.1})
        session.script_post(requests.ConnectionError("down"))
        sync.push_events()

        # Immediately retrying picks up nothing (backoff still active).
        assert sync.due_events() == []

        # Wind the clock back on the retry timestamp and it becomes due.
        db.execute("UPDATE sync_queue SET next_retry_at = 0")
        assert len(sync.due_events()) == 1

    def test_http_error_counts_as_failure(self, env):
        cfg, db, buffer, session, sync = env
        sync.enqueue("order.paid", {"order_id": "o9"}, ref_id="o9")
        session.script_post(FakeResponse(500))

        assert sync.push_events() == 0
        assert sync.queue_depth() == 1


class TestVideoUpload:
    def test_upload_marks_segment_uploaded(self, env, tmp_path):
        cfg, db, buffer, session, sync = env
        path = tmp_path / "videos" / "clip.mp4"
        path.write_bytes(b"\x00" * 4096)
        seg = buffer.add_segment(path, time.time() - 60, time.time())
        session.script_post(FakeResponse(200))

        assert sync.upload_videos() == 1
        assert buffer.get(seg.id).uploaded is True
        # File stays on disk: the 24h local buffer is a feature.
        assert path.exists()

        url, kwargs = session.posts[0]
        assert url.endswith("/videos")
        assert kwargs["data"]["segment_id"] == seg.id
        assert "file" in kwargs["files"]

    def test_upload_failure_keeps_segment_pending(self, env, tmp_path):
        cfg, db, buffer, session, sync = env
        path = tmp_path / "videos" / "clip.mp4"
        path.write_bytes(b"\x00" * 4096)
        seg = buffer.add_segment(path, time.time() - 60, time.time())
        session.script_post(requests.ConnectionError("no route"))

        assert sync.upload_videos() == 0
        assert buffer.get(seg.id).uploaded is False

    def test_missing_file_is_marked_uploaded_to_unblock_queue(self, env, tmp_path):
        cfg, db, buffer, session, sync = env
        seg = buffer.add_segment(
            tmp_path / "videos" / "ghost.mp4", time.time() - 60, time.time()
        )
        # File was never actually written.

        assert sync.upload_videos() == 0
        assert buffer.get(seg.id).uploaded is True


class TestConfigPull:
    def test_pull_applies_whitelisted_overrides(self, env):
        cfg, db, buffer, session, sync = env
        session.script_get(
            FakeResponse(200, {"overrides": {
                "heartbeat_interval": 120,
                "retention_hours": 48,
                "device_token": "nope",      # not whitelisted
                "segment_seconds": 1,        # clamped to minimum 10
            }})
        )

        applied = sync.pull_config()

        assert set(applied) == {"heartbeat_interval", "retention_hours", "segment_seconds"}
        assert cfg.heartbeat_interval == 120
        assert cfg.retention_hours == 48
        assert cfg.segment_seconds == 10  # clamped
        assert cfg.device_token == "tok"  # untouched
        assert sync.online is True

    def test_pull_404_is_not_an_error(self, env):
        cfg, db, buffer, session, sync = env
        session.script_get(FakeResponse(404))

        assert sync.pull_config() == []
        assert sync.online is True

    def test_pull_failure_goes_offline(self, env):
        cfg, db, buffer, session, sync = env
        session.script_get(requests.Timeout("slow link"))

        assert sync.pull_config() == []
        assert sync.online is False
