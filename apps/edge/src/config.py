"""Edge agent configuration.

All settings come from environment variables (see .env.example). Values that
can be tuned remotely by the cloud (heartbeat interval, retention, ...) are
mutable at runtime through :meth:`Settings.apply_remote`.

Dependency-free on purpose: the agent must stay under a 512MB memory budget
and start fast on a Raspberry Pi, so we use dataclasses + os.environ instead
of heavier settings frameworks.
"""

from __future__ import annotations

import logging
import os
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from . import __version__

log = logging.getLogger(__name__)


def _env(key: str, default: str) -> str:
    return os.environ.get(key, default)


def _env_int(key: str, default: int) -> int:
    raw = os.environ.get(key)
    if raw is None or raw == "":
        return default
    try:
        return int(raw)
    except ValueError:
        log.warning("Invalid int for %s=%r, using default %d", key, raw, default)
        return default


def _env_float(key: str, default: float) -> float:
    raw = os.environ.get(key)
    if raw is None or raw == "":
        return default
    try:
        return float(raw)
    except ValueError:
        log.warning("Invalid float for %s=%r, using default %s", key, raw, default)
        return default


def _env_bool(key: str, default: bool) -> bool:
    raw = os.environ.get(key)
    if raw is None or raw == "":
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


def _parse_camera_source(raw: str) -> int | str:
    """USB cameras are numeric device indexes, RTSP/HTTP sources are URLs."""
    raw = raw.strip()
    if raw.isdigit():
        return int(raw)
    return raw


#: Keys the cloud is allowed to override at runtime, with (min, max) clamps.
REMOTE_MUTABLE: dict[str, tuple[float, float]] = {
    "heartbeat_interval": (10, 3600),
    "sync_interval": (5, 3600),
    "segment_seconds": (10, 900),
    "retention_hours": (1, 24 * 30),
    "motion_threshold": (1.0, 64.0),
}


@dataclass
class Settings:
    # Identity
    device_id: str = ""
    device_token: str = ""

    # Cloud endpoints
    cloud_api: str = "https://api.hostia.com"
    pos_api: str = "http://localhost:8001"

    # Local storage
    data_dir: Path = Path("/var/lib/hostia-edge")
    app_dir: Path = Path("/opt/hostia-edge/current")

    # Camera
    camera_enabled: bool = True
    camera_source: int | str = 0
    camera_fps: int = 15
    camera_width: int = 1280
    camera_height: int = 720
    camera_reconnect_seconds: int = 5

    # Video buffer (24h rolling)
    segment_seconds: int = 60
    retention_hours: int = 24
    max_storage_gb: float = 8.0
    prune_interval: int = 300

    # Local motion analysis (offline mode)
    motion_enabled: bool = True
    motion_threshold: float = 8.0
    motion_cooldown_seconds: int = 30
    motion_frame_skip: int = 5

    # Cloud sync / heartbeat / OTA
    sync_interval: int = 30
    sync_batch_size: int = 50
    heartbeat_interval: int = 60
    update_enabled: bool = True
    update_channel: str = "stable"
    update_interval: int = 6 * 3600
    request_timeout: int = 15

    # Local offline API (POS bridge for tablets on the LAN)
    local_api_enabled: bool = True
    local_api_host: str = "0.0.0.0"
    local_api_port: int = 8090
    local_api_key: str = ""  # optional shared secret for LAN clients

    log_level: str = "INFO"

    version: str = field(default=__version__, init=False)

    # ─── Derived paths ────────────────────────────────────────────────
    @property
    def video_dir(self) -> Path:
        return self.data_dir / "videos"

    @property
    def db_path(self) -> Path:
        return self.data_dir / "edge.db"

    @property
    def releases_dir(self) -> Path:
        return self.data_dir / "releases"

    @property
    def updates_dir(self) -> Path:
        return self.data_dir / "updates"

    @property
    def max_storage_bytes(self) -> int:
        return int(self.max_storage_gb * (1024 ** 3))

    @classmethod
    def load(cls) -> "Settings":
        """Build settings from environment variables."""
        data_dir = Path(_env("DATA_DIR", "/var/lib/hostia-edge"))
        cfg = cls(
            device_id=_env("DEVICE_ID", ""),
            device_token=_env("DEVICE_TOKEN", ""),
            cloud_api=_env("CLOUD_API", "https://api.hostia.com").rstrip("/"),
            pos_api=_env("POS_API", "http://localhost:8001").rstrip("/"),
            data_dir=data_dir,
            app_dir=Path(_env("APP_DIR", "/opt/hostia-edge/current")),
            camera_enabled=_env_bool("CAMERA_ENABLED", True),
            camera_source=_parse_camera_source(_env("CAMERA_SOURCE", "0")),
            camera_fps=_env_int("CAMERA_FPS", 15),
            camera_width=_env_int("CAMERA_WIDTH", 1280),
            camera_height=_env_int("CAMERA_HEIGHT", 720),
            camera_reconnect_seconds=_env_int("CAMERA_RECONNECT_SECONDS", 5),
            segment_seconds=_env_int("SEGMENT_SECONDS", 60),
            retention_hours=_env_int("RETENTION_HOURS", 24),
            max_storage_gb=_env_float("MAX_STORAGE_GB", 8.0),
            prune_interval=_env_int("PRUNE_INTERVAL", 300),
            motion_enabled=_env_bool("MOTION_ENABLED", True),
            motion_threshold=_env_float("MOTION_THRESHOLD", 8.0),
            motion_cooldown_seconds=_env_int("MOTION_COOLDOWN_SECONDS", 30),
            motion_frame_skip=_env_int("MOTION_FRAME_SKIP", 5),
            sync_interval=_env_int("SYNC_INTERVAL", 30),
            sync_batch_size=_env_int("SYNC_BATCH_SIZE", 50),
            heartbeat_interval=_env_int("HEARTBEAT_INTERVAL", 60),
            update_enabled=_env_bool("UPDATE_ENABLED", True),
            update_channel=_env("UPDATE_CHANNEL", "stable"),
            update_interval=_env_int("UPDATE_INTERVAL", 6 * 3600),
            request_timeout=_env_int("REQUEST_TIMEOUT", 15),
            local_api_enabled=_env_bool("LOCAL_API_ENABLED", True),
            local_api_host=_env("LOCAL_API_HOST", "0.0.0.0"),
            local_api_port=_env_int("LOCAL_API_PORT", 8090),
            local_api_key=_env("LOCAL_API_KEY", ""),
            log_level=_env("LOG_LEVEL", "INFO").upper(),
        )
        cfg.ensure_dirs()
        if not cfg.device_id:
            cfg.device_id = cfg._load_or_create_device_id()
        return cfg

    def ensure_dirs(self) -> None:
        for path in (self.data_dir, self.video_dir, self.releases_dir, self.updates_dir):
            path.mkdir(parents=True, exist_ok=True)

    def _load_or_create_device_id(self) -> str:
        """Persist a stable device identity across reboots."""
        id_file = self.data_dir / "device_id"
        if id_file.exists():
            stored = id_file.read_text().strip()
            if stored:
                return stored
        device_id = uuid.uuid4().hex
        id_file.write_text(device_id)
        log.info("Generated new device_id: %s", device_id)
        return device_id

    # ─── Remote configuration ─────────────────────────────────────────
    def apply_remote(self, overrides: dict[str, Any]) -> list[str]:
        """Apply cloud-pushed configuration to whitelisted, clamped fields.

        Returns the list of applied keys (useful for logs and tests).
        """
        applied: list[str] = []
        for key, value in overrides.items():
            if key not in REMOTE_MUTABLE:
                log.debug("Ignoring remote override for unknown key %r", key)
                continue
            lo, hi = REMOTE_MUTABLE[key]
            try:
                numeric = float(value)
            except (TypeError, ValueError):
                log.warning("Ignoring non-numeric override %s=%r", key, value)
                continue
            clamped = min(max(numeric, lo), hi)
            current = getattr(self, key)
            if isinstance(current, int):
                clamped = int(clamped)
            if clamped != current:
                setattr(self, key, clamped)
                applied.append(key)
                log.info("Remote config: %s %r -> %r", key, current, clamped)
        return applied

    def snapshot(self) -> dict[str, Any]:
        """Safe, serializable view used by the heartbeat payload."""
        return {
            "device_id": self.device_id,
            "version": self.version,
            "cloud_api": self.cloud_api,
            "camera_source": str(self.camera_source),
            "camera_fps": self.camera_fps,
            "segment_seconds": self.segment_seconds,
            "retention_hours": self.retention_hours,
            "max_storage_gb": self.max_storage_gb,
            "update_channel": self.update_channel,
        }
