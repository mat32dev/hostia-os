"""Central configuration for the Guard service.

All settings can be overridden with environment variables (case-insensitive)
or via a ``.env`` file in the service root.
"""

from functools import lru_cache
from typing import Optional

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings for Host.ia Guard."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ─── Application ───
    app_name: str = "Host.ia Guard"
    environment: str = "development"
    debug: bool = False
    api_prefix: str = "/v1"
    cors_origins: str = "*"

    # ─── Database / queue ───
    database_url: str = "sqlite:///./guard.db"
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: Optional[str] = None
    celery_result_backend: Optional[str] = None

    # ─── Storage (MinIO / S3 or local filesystem) ───
    storage_backend: str = "minio"  # "minio" | "local"
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_secure: bool = False
    minio_bucket_videos: str = "guard-videos"
    minio_bucket_frames: str = "guard-frames"
    local_storage_dir: str = "./data"
    max_upload_mb: int = 500

    # ─── Models ───
    yolo_model_path: str = "models/cash-yolov8n.pt"
    yolo_fallback_model: str = "yolov8n.pt"
    yolo_confidence: float = 0.35
    vlm_model_name: str = Field(
        default="HuggingFaceTB/SmolVLM2-2.2B-Instruct",
        validation_alias=AliasChoices("VLM_MODEL_NAME", "HF_MODEL"),
    )
    vlm_max_new_tokens: int = 256
    device: str = "auto"  # "auto" | "cuda" | "cpu" | "mps"
    use_mock_models: bool = False  # deterministic heuristic models (dev/tests)

    # ─── Frame extraction ───
    frame_extraction_fps: float = 2.0
    activity_threshold: float = 8.0  # mean abs pixel diff (0-255 scale)
    activity_padding: int = 1  # frames kept around an active frame
    max_frames_per_video: int = 60

    # ─── Event building ───
    event_gap_tolerance_s: float = 3.0
    min_event_confidence: float = 0.30

    # ─── POS matching ───
    match_window_seconds: int = 180
    min_match_confidence: float = 0.50
    amount_mismatch_tolerance: float = 5.0
    high_amount_mismatch: float = 50.0
    currency: str = "EUR"

    # ─── Alerts ───
    critical_unregistered_amount: float = 200.0
    alert_repeat_window_hours: int = 24
    alert_repeat_threshold: int = 3

    # ─── RLHF feedback loop ───
    feedback_min_samples: int = 20
    feedback_window: int = 200
    feedback_export_path: str = "rlhf/dataset.jsonl"

    @property
    def resolved_device(self) -> str:
        """Resolve "auto" device to cuda when available, else cpu."""
        if self.device != "auto":
            return self.device
        try:
            import torch

            return "cuda" if torch.cuda.is_available() else "cpu"
        except ImportError:
            return "cpu"

    @property
    def broker_url(self) -> str:
        return self.celery_broker_url or self.redis_url

    @property
    def result_backend(self) -> str:
        return self.celery_result_backend or self.redis_url

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    """Return the process-wide cached settings instance."""
    return Settings()
