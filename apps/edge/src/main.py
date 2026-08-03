"""Host.ia Edge agent — main entry point.

Starts every service as a daemon thread and supervises them:

    camera capture ──> video buffer (24h rolling, SQLite)
                   └─> motion analyzer ──> sync queue
    local POS API (offline) ──> sync queue
    sync worker ──> cloud (events, videos, config)
    heartbeat ──> cloud (status every 60s)
    OTA updater ──> cloud (release polling)

Everything is interruptible via SIGTERM/SIGINT; on an applied OTA update the
process re-execs itself so the new code takes over (systemd/Docker restart
policies cover the crash path).
"""

from __future__ import annotations

import argparse
import logging
import os
import signal
import sys
import threading
import time

from . import __version__
from .buffer import VideoBuffer
from .camera import CameraCapture
from .config import Settings
from .db import Database
from .heartbeat import Heartbeat
from .offline import LocalAPI, LocalPOS, MotionAnalyzer
from .sync import CloudSync
from .updater import Updater

log = logging.getLogger("hostia-edge")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(prog="hostia-edge", description=__doc__)
    parser.add_argument("--version", action="store_true", help="print version and exit")
    parser.add_argument(
        "--rollback",
        action="store_true",
        help="point the installation at the previous release and exit",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    if args.version:
        print(f"hostia-edge {__version__}")
        return 0

    cfg = Settings.load()
    logging.basicConfig(
        level=getattr(logging, cfg.log_level, logging.INFO),
        format="%(asctime)s %(levelname)-7s %(name)s: %(message)s",
        stream=sys.stdout,
    )

    if args.rollback:
        rolled = Updater(cfg).rollback()
        return 0 if rolled else 1

    log.info(
        "Starting hostia-edge %s (device=%s, cloud=%s)",
        cfg.version, cfg.device_id, cfg.cloud_api,
    )

    # ─── Wire services ────────────────────────────────────────────────
    db = Database(cfg.db_path)
    buffer = VideoBuffer(cfg, db)
    sync = CloudSync(cfg, db, buffer)
    pos = LocalPOS(db, enqueue=sync.enqueue)

    analyzer = None
    if cfg.motion_enabled:
        analyzer = MotionAnalyzer(cfg, enqueue=sync.enqueue)

    camera = None
    if cfg.camera_enabled:
        camera = CameraCapture(
            cfg,
            on_segment=buffer.add_segment,
            on_frame=analyzer.process if analyzer else None,
        )

    heartbeat = Heartbeat(cfg, buffer, sync, camera=camera)
    updater = Updater(cfg)

    def status() -> dict:
        return {
            "status": "ok",
            "version": cfg.version,
            "device_id": cfg.device_id,
            "uptime_sec": int(time.time() - heartbeat.started_at),
            "sync": sync.status(),
            "camera": camera.status() if camera else {"enabled": False},
            "pos": pos.daily_summary(),
        }

    api = None
    if cfg.local_api_enabled:
        api = LocalAPI(cfg, pos, status_provider=status)

    # ─── Start ────────────────────────────────────────────────────────
    services = [buffer, sync, heartbeat]
    if cfg.update_enabled:
        services.append(updater)
    if api:
        services.append(api)
    if camera:
        services.append(camera)

    for service in services:
        try:
            service.start()
        except Exception:
            # Graceful degradation: a dead service must not kill the agent.
            log.exception("Service %s failed to start", type(service).__name__)

    # ─── Shutdown wiring ──────────────────────────────────────────────
    shutdown = threading.Event()

    def _signal(signum, _frame):
        log.info("Received signal %d, shutting down", signum)
        shutdown.set()

    signal.signal(signal.SIGTERM, _signal)
    signal.signal(signal.SIGINT, _signal)

    # ─── Supervise ────────────────────────────────────────────────────
    restart = False
    try:
        while not shutdown.wait(1.0):
            if updater.restart_requested.is_set():
                log.info("OTA update applied; restarting into new release")
                restart = True
                break
    finally:
        for service in reversed(services):
            try:
                service.stop()
            except Exception:
                log.exception("Error stopping %s", type(service).__name__)
        db.close()

    log.info("Agent stopped")
    if restart:
        log.info("Re-executing: %s %s", sys.executable, sys.argv)
        os.execv(sys.executable, [sys.executable, *sys.argv])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
