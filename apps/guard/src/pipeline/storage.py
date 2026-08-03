"""Object storage for videos and frames.

Primary backend is MinIO (S3-compatible). A local-filesystem backend is
available for development/tests (``storage_backend=local``). The ``minio``
package is imported lazily so the API can boot without it installed.
"""

import logging
import os
import shutil
from datetime import timedelta
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class StorageService:
    """Stores raw videos (videos bucket) and keyframes (frames bucket)."""

    def __init__(self, settings):
        self.settings = settings
        self.backend = (settings.storage_backend or "minio").lower()
        self._client = None
        if self.backend == "minio":
            self._connect_minio()
        elif self.backend == "local":
            self._root = Path(settings.local_storage_dir)
        else:
            raise ValueError(f"Unknown storage backend: {self.backend!r}")

    # ── backend setup ───────────────────────────────────────────────
    def _connect_minio(self) -> None:
        from minio import Minio  # lazy import

        self._client = Minio(
            self.settings.minio_endpoint,
            access_key=self.settings.minio_access_key,
            secret_key=self.settings.minio_secret_key,
            secure=bool(self.settings.minio_secure),
        )

    @property
    def _buckets(self) -> dict:
        return {
            "videos": self.settings.minio_bucket_videos,
            "frames": self.settings.minio_bucket_frames,
        }

    def ensure_buckets(self) -> None:
        """Create buckets/directories if they don't exist. Idempotent."""
        if self.backend == "local":
            for name in ("videos", "frames"):
                (self._root / name).mkdir(parents=True, exist_ok=True)
            return
        for bucket in self._buckets.values():
            if not self._client.bucket_exists(bucket):
                self._client.make_bucket(bucket)
                logger.info("storage: created bucket %s", bucket)

    def health(self) -> bool:
        """Lightweight connectivity check for the health endpoint."""
        try:
            if self.backend == "local":
                return os.access(self._root, os.W_OK) if self._root.exists() else True
            return self._client.bucket_exists(self.settings.minio_bucket_videos)
        except Exception:
            return False

    # ── videos ──────────────────────────────────────────────────────
    def upload_video(self, local_path: str, key: str) -> str:
        if self.backend == "local":
            dest = self._root / "videos" / key
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(local_path, dest)
            return key
        self._client.fput_object(self.settings.minio_bucket_videos, key, local_path)
        return key

    def download_video(self, key: str, dest_path: str) -> str:
        if self.backend == "local":
            src = self._root / "videos" / key
            if not src.is_file():
                raise FileNotFoundError(f"Video not found in storage: {key}")
            shutil.copyfile(src, dest_path)
            return dest_path
        self._client.fget_object(self.settings.minio_bucket_videos, key, dest_path)
        return dest_path

    # ── frames ──────────────────────────────────────────────────────
    def upload_frame(self, local_path: str, key: str) -> str:
        if self.backend == "local":
            dest = self._root / "frames" / key
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(local_path, dest)
            return key
        self._client.fput_object(
            self.settings.minio_bucket_frames, key, local_path, content_type="image/jpeg"
        )
        return key

    # ── access ──────────────────────────────────────────────────────
    def presigned_url(self, key: str, bucket: str = "videos", expires_s: int = 3600) -> Optional[str]:
        """Temporary download URL (MinIO) or local path (local backend)."""
        if self.backend == "local":
            return str((self._root / bucket / key).resolve())
        bucket_name = self._buckets.get(bucket, bucket)
        return self._client.presigned_get_object(
            bucket_name, key, expires=timedelta(seconds=expires_s)
        )

    def delete_video(self, key: str) -> None:
        if self.backend == "local":
            target = self._root / "videos" / key
            if target.is_file():
                target.unlink()
            return
        self._client.remove_object(self.settings.minio_bucket_videos, key)


_STORAGE: Optional[StorageService] = None


def get_storage(settings=None) -> StorageService:
    """Process-wide shared storage client."""
    global _STORAGE
    if _STORAGE is None:
        from ..config import get_settings

        _STORAGE = StorageService(settings or get_settings())
    return _STORAGE
