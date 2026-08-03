"""SQLite connection handling for the edge agent.

Design notes:
- WAL journal mode so the camera writer, sync worker and local API can hit
  the database concurrently from different threads.
- One connection per thread (``threading.local``); sqlite3 connections are
  not safe to share across threads when transactions are in flight.
- Short, explicit transactions via :meth:`Database.transaction`.
"""

from __future__ import annotations

import sqlite3
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

_SCHEMA = """
CREATE TABLE IF NOT EXISTS videos (
    id           TEXT PRIMARY KEY,
    path         TEXT NOT NULL,
    started_at   REAL NOT NULL,
    ended_at     REAL,
    duration_sec REAL DEFAULT 0,
    size_bytes   INTEGER DEFAULT 0,
    uploaded     INTEGER NOT NULL DEFAULT 0,
    uploaded_at  REAL,
    created_at   REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_videos_started ON videos(started_at);
CREATE INDEX IF NOT EXISTS idx_videos_uploaded ON videos(uploaded, started_at);

CREATE TABLE IF NOT EXISTS orders (
    id          TEXT PRIMARY KEY,
    table_number TEXT NOT NULL DEFAULT '',
    items       TEXT NOT NULL DEFAULT '[]',
    total_cents INTEGER NOT NULL DEFAULT 0,
    status      TEXT NOT NULL DEFAULT 'open',
    note        TEXT NOT NULL DEFAULT '',
    synced      INTEGER NOT NULL DEFAULT 0,
    created_at  REAL NOT NULL,
    updated_at  REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at);

CREATE TABLE IF NOT EXISTS sync_queue (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    kind          TEXT NOT NULL,
    payload       TEXT NOT NULL,
    ref_id        TEXT NOT NULL DEFAULT '',
    attempts      INTEGER NOT NULL DEFAULT 0,
    next_retry_at REAL NOT NULL DEFAULT 0,
    last_error    TEXT NOT NULL DEFAULT '',
    created_at    REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sync_due ON sync_queue(next_retry_at);

CREATE TABLE IF NOT EXISTS kv_state (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
"""


class Database:
    """Thin, thread-safe wrapper around sqlite3."""

    def __init__(self, path: str | Path):
        self.path = str(path)
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        self._local = threading.local()
        with self.connect() as conn:
            conn.executescript(_SCHEMA)

    def connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.path, timeout=30, isolation_level=None)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        conn.execute("PRAGMA busy_timeout=30000")
        conn.execute("PRAGMA synchronous=NORMAL")
        return conn

    @property
    def conn(self) -> sqlite3.Connection:
        """Connection bound to the calling thread (created lazily)."""
        conn = getattr(self._local, "conn", None)
        if conn is None:
            conn = self.connect()
            self._local.conn = conn
        return conn

    @contextmanager
    def transaction(self) -> Iterator[sqlite3.Connection]:
        conn = self.conn
        conn.execute("BEGIN IMMEDIATE")
        try:
            yield conn
        except Exception:
            conn.execute("ROLLBACK")
            raise
        else:
            conn.execute("COMMIT")

    # ─── Convenience helpers ──────────────────────────────────────────
    def execute(self, sql: str, params: tuple = ()) -> sqlite3.Cursor:
        return self.conn.execute(sql, params)

    def query(self, sql: str, params: tuple = ()) -> list[sqlite3.Row]:
        return list(self.conn.execute(sql, params))

    def query_one(self, sql: str, params: tuple = ()) -> sqlite3.Row | None:
        return self.conn.execute(sql, params).fetchone()

    def scalar(self, sql: str, params: tuple = (), default: Any = None) -> Any:
        row = self.query_one(sql, params)
        return row[0] if row is not None else default

    def close(self) -> None:
        conn = getattr(self._local, "conn", None)
        if conn is not None:
            conn.close()
            self._local.conn = None
