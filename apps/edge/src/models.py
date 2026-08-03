"""Data models for the local edge database.

Plain dataclasses over the SQLite tables defined in :mod:`src.db`. Times are
stored as Unix epoch floats (UTC) to keep pruning/retention math trivial.
"""

from __future__ import annotations

import json
import sqlite3
import time
import uuid
from dataclasses import dataclass, field
from typing import Any


def utcnow() -> float:
    return time.time()


def new_id() -> str:
    return uuid.uuid4().hex


def iso(ts: float) -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(ts))


@dataclass
class VideoSegment:
    id: str
    path: str
    started_at: float
    ended_at: float | None = None
    duration_sec: float = 0.0
    size_bytes: int = 0
    uploaded: bool = False
    uploaded_at: float | None = None
    created_at: float = field(default_factory=utcnow)

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "VideoSegment":
        return cls(
            id=row["id"],
            path=row["path"],
            started_at=row["started_at"],
            ended_at=row["ended_at"],
            duration_sec=row["duration_sec"] or 0.0,
            size_bytes=row["size_bytes"] or 0,
            uploaded=bool(row["uploaded"]),
            uploaded_at=row["uploaded_at"],
            created_at=row["created_at"],
        )

    def to_payload(self) -> dict[str, Any]:
        return {
            "segment_id": self.id,
            "started_at": iso(self.started_at),
            "ended_at": iso(self.ended_at) if self.ended_at else None,
            "duration_sec": round(self.duration_sec, 2),
            "size_bytes": self.size_bytes,
        }


@dataclass
class Order:
    id: str
    table_number: str = ""
    items: list[dict[str, Any]] = field(default_factory=list)
    total_cents: int = 0
    status: str = "open"  # open | paid | void
    note: str = ""
    synced: bool = False
    created_at: float = field(default_factory=utcnow)
    updated_at: float = field(default_factory=utcnow)

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "Order":
        try:
            items = json.loads(row["items"])
        except (ValueError, TypeError):
            items = []
        return cls(
            id=row["id"],
            table_number=row["table_number"],
            items=items,
            total_cents=row["total_cents"],
            status=row["status"],
            note=row["note"],
            synced=bool(row["synced"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "table_number": self.table_number,
            "items": self.items,
            "total_cents": self.total_cents,
            "status": self.status,
            "note": self.note,
            "synced": self.synced,
            "created_at": iso(self.created_at),
            "updated_at": iso(self.updated_at),
        }


@dataclass
class SyncEvent:
    id: int
    kind: str
    payload: dict[str, Any]
    ref_id: str = ""
    attempts: int = 0
    next_retry_at: float = 0.0
    last_error: str = ""
    created_at: float = field(default_factory=utcnow)

    @classmethod
    def from_row(cls, row: sqlite3.Row) -> "SyncEvent":
        try:
            payload = json.loads(row["payload"])
        except (ValueError, TypeError):
            payload = {}
        return cls(
            id=row["id"],
            kind=row["kind"],
            payload=payload,
            ref_id=row["ref_id"],
            attempts=row["attempts"],
            next_retry_at=row["next_retry_at"],
            last_error=row["last_error"],
            created_at=row["created_at"],
        )

    def to_wire(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "kind": self.kind,
            "ref_id": self.ref_id,
            "payload": self.payload,
            "created_at": iso(self.created_at),
        }
