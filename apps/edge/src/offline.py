"""Offline mode: local POS database, local analysis, LAN API.

When the internet drops, the bar keeps running:
- orders are taken against the local SQLite database and queued for sync
- a tiny stdlib HTTP API serves POS clients (tablets) on the local network
- motion detection runs on camera frames locally, no cloud required
"""

from __future__ import annotations

import json
import logging
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Callable
from urllib.parse import urlparse, parse_qs

from .config import Settings
from .db import Database
from .models import Order, new_id, utcnow

log = logging.getLogger(__name__)

try:
    import cv2
except ImportError:
    cv2 = None  # type: ignore[assignment]


# ─── Local POS ──────────────────────────────────────────────────────────────
class LocalPOS:
    """SQLite-backed order management. Works with zero connectivity."""

    VALID_TRANSITIONS = {"open": {"paid", "void"}, "paid": set(), "void": set()}

    def __init__(self, db: Database, enqueue: Callable[[str, dict, str], int]):
        self.db = db
        self._enqueue = enqueue

    def create_order(
        self,
        table_number: str,
        items: list[dict[str, Any]],
        note: str = "",
    ) -> Order:
        if not items:
            raise ValueError("Order must contain at least one item")
        total = self._total(items)
        now = utcnow()
        order = Order(
            id=new_id(),
            table_number=str(table_number),
            items=items,
            total_cents=total,
            status="open",
            note=note,
            created_at=now,
            updated_at=now,
        )
        self.db.execute(
            """INSERT INTO orders
               (id, table_number, items, total_cents, status, note,
                synced, created_at, updated_at)
               VALUES (?,?,?,?,?,?,0,?,?)""",
            (
                order.id, order.table_number, json.dumps(items),
                order.total_cents, order.status, order.note,
                order.created_at, order.updated_at,
            ),
        )
        self._enqueue("order.created", order.to_dict(), order.id)
        log.info(
            "Local order %s: table %s, %d items, %d cents",
            order.id, order.table_number, len(items), total,
        )
        return order

    def add_payment(self, order_id: str, method: str, amount_cents: int) -> Order:
        order = self.get(order_id)
        if order is None:
            raise KeyError(f"Unknown order {order_id}")
        if "paid" not in self.VALID_TRANSITIONS.get(order.status, set()):
            raise ValueError(f"Cannot pay order in status {order.status}")
        now = utcnow()
        self.db.execute(
            "UPDATE orders SET status = 'paid', updated_at = ? WHERE id = ?",
            (now, order_id),
        )
        self._enqueue(
            "order.paid",
            {
                "order_id": order_id,
                "method": method,
                "amount_cents": int(amount_cents),
                "paid_at": now,
            },
            order_id,
        )
        return self.get(order_id)

    def void_order(self, order_id: str, reason: str = "") -> Order:
        order = self.get(order_id)
        if order is None:
            raise KeyError(f"Unknown order {order_id}")
        if "void" not in self.VALID_TRANSITIONS.get(order.status, set()):
            raise ValueError(f"Cannot void order in status {order.status}")
        now = utcnow()
        self.db.execute(
            "UPDATE orders SET status = 'void', updated_at = ? WHERE id = ?",
            (now, order_id),
        )
        self._enqueue(
            "order.voided", {"order_id": order_id, "reason": reason}, order_id
        )
        return self.get(order_id)

    def get(self, order_id: str) -> Order | None:
        row = self.db.query_one("SELECT * FROM orders WHERE id = ?", (order_id,))
        return Order.from_row(row) if row else None

    def list_orders(self, status: str | None = None, limit: int = 100) -> list[Order]:
        if status:
            rows = self.db.query(
                "SELECT * FROM orders WHERE status = ? "
                "ORDER BY created_at DESC LIMIT ?",
                (status, limit),
            )
        else:
            rows = self.db.query(
                "SELECT * FROM orders ORDER BY created_at DESC LIMIT ?", (limit,)
            )
        return [Order.from_row(r) for r in rows]

    def daily_summary(self, day_start: float | None = None) -> dict:
        if day_start is None:
            day_start = time.mktime(time.localtime()[:3] + (0, 0, 0, 0, 0, -1))
        row = self.db.query_one(
            """SELECT COUNT(*) AS orders,
                      COALESCE(SUM(CASE WHEN status = 'paid'
                                   THEN total_cents ELSE 0 END), 0) AS revenue_cents,
                      COALESCE(SUM(CASE WHEN status = 'open'
                                   THEN 1 ELSE 0 END), 0) AS open_orders
               FROM orders WHERE created_at >= ?""",
            (day_start,),
        )
        return {
            "orders": row["orders"],
            "revenue_cents": row["revenue_cents"],
            "open_orders": row["open_orders"],
        }

    @staticmethod
    def _total(items: list[dict[str, Any]]) -> int:
        total = 0
        for item in items:
            qty = int(item.get("qty", 1))
            price = int(item.get("price_cents", 0))
            if qty <= 0 or price < 0:
                raise ValueError(f"Invalid item: {item!r}")
            total += qty * price
        return total


# ─── Local motion analysis ──────────────────────────────────────────────────
class MotionAnalyzer:
    """Frame-difference motion detection. Pure local, near-zero CPU cost."""

    def __init__(self, cfg: Settings, enqueue: Callable[[str, dict, str], int]):
        self.cfg = cfg
        self._enqueue = enqueue
        self._prev = None
        self._last_alert = 0.0
        self.events = 0

    def process(self, frame) -> float | None:
        """Feed a sampled camera frame; returns motion score (0-255)."""
        if cv2 is None:
            return None
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, (160, 120))
        gray = cv2.GaussianBlur(gray, (5, 5), 0)
        if self._prev is None:
            self._prev = gray
            return None
        diff = cv2.absdiff(gray, self._prev)
        self._prev = gray
        score = float(diff.mean())
        now = time.time()
        if (
            score >= self.cfg.motion_threshold
            and now - self._last_alert >= self.cfg.motion_cooldown_seconds
        ):
            self._last_alert = now
            self.events += 1
            self._enqueue(
                "motion.detected",
                {"score": round(score, 2), "detected_at": now},
                "",
            )
            log.info("Motion detected (score=%.1f)", score)
        return score


# ─── Local HTTP API (stdlib only) ───────────────────────────────────────────
class LocalAPI:
    """Small LAN-facing API so POS tablets keep working offline."""

    def __init__(
        self,
        cfg: Settings,
        pos: LocalPOS,
        status_provider: Callable[[], dict],
    ):
        self.cfg = cfg
        self.pos = pos
        self.status_provider = status_provider
        self._server: ThreadingHTTPServer | None = None
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        pos, cfg, status_provider = self.pos, self.cfg, self.status_provider

        class Handler(BaseHTTPRequestHandler):
            server_version = f"hostia-edge/{cfg.version}"
            protocol_version = "HTTP/1.1"

            # -- helpers ------------------------------------------------
            def _auth_ok(self) -> bool:
                if not cfg.local_api_key:
                    return True
                return self.headers.get("X-Edge-Key", "") == cfg.local_api_key

            def _send_json(self, code: int, body: dict) -> None:
                payload = json.dumps(body).encode()
                self.send_response(code)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)

            def _read_json(self) -> dict:
                length = int(self.headers.get("Content-Length") or 0)
                if length <= 0 or length > 1_000_000:
                    return {}
                try:
                    return json.loads(self.rfile.read(length))
                except ValueError:
                    return {}

            def log_message(self, fmt, *args):  # quiet; use module logger
                log.debug("local-api " + fmt, *args)

            # -- routes --------------------------------------------------
            def do_GET(self):
                if not self._auth_ok():
                    return self._send_json(401, {"error": "unauthorized"})
                parsed = urlparse(self.path)
                if parsed.path == "/healthz":
                    return self._send_json(200, status_provider())
                if parsed.path == "/v1/orders":
                    qs = parse_qs(parsed.query)
                    status = qs.get("status", [None])[0]
                    orders = pos.list_orders(status=status)
                    return self._send_json(
                        200, {"orders": [o.to_dict() for o in orders]}
                    )
                if parsed.path == "/v1/summary":
                    return self._send_json(200, pos.daily_summary())
                return self._send_json(404, {"error": "not found"})

            def do_POST(self):
                if not self._auth_ok():
                    return self._send_json(401, {"error": "unauthorized"})
                parsed = urlparse(self.path)
                body = self._read_json()
                if parsed.path == "/v1/orders":
                    try:
                        order = pos.create_order(
                            table_number=body.get("table_number", ""),
                            items=body.get("items") or [],
                            note=body.get("note", ""),
                        )
                    except ValueError as exc:
                        return self._send_json(400, {"error": str(exc)})
                    return self._send_json(201, order.to_dict())
                if parsed.path.startswith("/v1/orders/"):
                    parts = parsed.path.strip("/").split("/")
                    if len(parts) == 4 and parts[3] == "pay":
                        try:
                            order = pos.add_payment(
                                parts[2],
                                method=body.get("method", "cash"),
                                amount_cents=int(body.get("amount_cents", 0)),
                            )
                        except KeyError as exc:
                            return self._send_json(404, {"error": str(exc)})
                        except (ValueError, TypeError) as exc:
                            return self._send_json(400, {"error": str(exc)})
                        return self._send_json(200, order.to_dict())
                    if len(parts) == 4 and parts[3] == "void":
                        try:
                            order = pos.void_order(
                                parts[2], reason=body.get("reason", "")
                            )
                        except KeyError as exc:
                            return self._send_json(404, {"error": str(exc)})
                        except ValueError as exc:
                            return self._send_json(400, {"error": str(exc)})
                        return self._send_json(200, order.to_dict())
                return self._send_json(404, {"error": "not found"})

        self._server = ThreadingHTTPServer(
            (self.cfg.local_api_host, self.cfg.local_api_port), Handler
        )
        self._server.daemon_threads = True
        self._thread = threading.Thread(
            target=self._server.serve_forever, name="local-api", daemon=True
        )
        self._thread.start()
        log.info(
            "Local API listening on %s:%d",
            self.cfg.local_api_host, self.cfg.local_api_port,
        )

    def stop(self) -> None:
        if self._server:
            self._server.shutdown()
            self._server.server_close()
        if self._thread:
            self._thread.join(timeout=5)
