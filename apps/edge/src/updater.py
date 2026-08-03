"""OTA (over-the-air) updates.

Release layout on the device:

    /var/lib/hostia-edge/releases/<version>/   # unpacked releases
    /opt/hostia-edge/current                   # symlink -> active release

Flow: poll the cloud for the latest release for this channel/arch, download
the tarball, verify its SHA-256, unpack into a new release directory, install
any new Python dependencies, atomically flip the ``current`` symlink, then
re-exec the process so the new code takes over. The previous release stays
on disk for instant rollback (``python -m src.main --rollback``).
"""

from __future__ import annotations

import hashlib
import logging
import os
import platform
import shutil
import subprocess
import sys
import tarfile
import tempfile
import threading
from pathlib import Path

import requests

from .config import Settings

log = logging.getLogger(__name__)

KEEP_RELEASES = 3


def parse_version(v: str) -> tuple[int, ...]:
    parts = []
    for chunk in v.strip().lstrip("v").split("."):
        digits = "".join(c for c in chunk if c.isdigit())
        parts.append(int(digits) if digits else 0)
    return tuple(parts)


def is_newer(candidate: str, current: str) -> bool:
    a, b = parse_version(candidate), parse_version(current)
    length = max(len(a), len(b))
    return a + (0,) * (length - len(a)) > b + (0,) * (length - len(b))


class Updater:
    def __init__(
        self,
        cfg: Settings,
        session: requests.Session | None = None,
    ):
        self.cfg = cfg
        self.session = session or requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {cfg.device_token}",
                "X-Device-Id": cfg.device_id,
                "User-Agent": f"hostia-edge/{cfg.version}",
            }
        )
        self.restart_requested = threading.Event()
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    # ─── Check ────────────────────────────────────────────────────────
    def check(self) -> dict | None:
        """Return release info when a newer version exists, else None."""
        url = f"{self.cfg.cloud_api}/v1/edge/releases/latest"
        try:
            resp = self.session.get(
                url,
                params={
                    "channel": self.cfg.update_channel,
                    "arch": platform.machine() or "unknown",
                },
                timeout=self.cfg.request_timeout,
            )
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            release = resp.json()
        except (requests.RequestException, ValueError) as exc:
            log.warning("Update check failed: %s", exc)
            return None
        version = str(release.get("version", ""))
        if not version or not is_newer(version, self.cfg.version):
            return None
        if not release.get("url") or not release.get("sha256"):
            log.warning("Release %s missing url/sha256, skipping", version)
            return None
        log.info("Update available: %s -> %s", self.cfg.version, version)
        return release

    # ─── Download + verify ────────────────────────────────────────────
    def download(self, release: dict) -> Path | None:
        target = self.cfg.updates_dir / f"release-{release['version']}.tar.gz"
        sha = hashlib.sha256()
        try:
            with self.session.get(release["url"], stream=True, timeout=60) as resp:
                resp.raise_for_status()
                with open(target, "wb") as fh:
                    for chunk in resp.iter_content(chunk_size=1 << 16):
                        fh.write(chunk)
                        sha.update(chunk)
        except requests.RequestException as exc:
            log.warning("Release download failed: %s", exc)
            target.unlink(missing_ok=True)
            return None
        digest = sha.hexdigest()
        if digest.lower() != str(release["sha256"]).lower():
            log.error(
                "SHA-256 mismatch for %s: got %s, want %s",
                release["version"], digest, release["sha256"],
            )
            target.unlink(missing_ok=True)
            return None
        return target

    # ─── Apply ────────────────────────────────────────────────────────
    @staticmethod
    def _safe_extract(tarball: Path, dest: Path) -> None:
        """Extract rejecting path-traversal entries."""
        dest_resolved = dest.resolve()
        with tarfile.open(tarball, "r:gz") as tar:
            for member in tar.getmembers():
                member_path = (dest / member.name).resolve()
                if not str(member_path).startswith(str(dest_resolved) + os.sep):
                    raise ValueError(f"Unsafe path in tarball: {member.name}")
            tar.extractall(dest, filter="data")

    def apply(self, tarball: Path, version: str) -> bool:
        dest = self.cfg.releases_dir / version
        if dest.exists():
            shutil.rmtree(dest)
        dest.mkdir(parents=True)
        try:
            self._safe_extract(tarball, dest)
        except (tarfile.TarError, ValueError, OSError) as exc:
            log.error("Release extraction failed: %s", exc)
            shutil.rmtree(dest, ignore_errors=True)
            return False

        # Install dependencies into the shared venv if they changed.
        requirements = dest / "requirements.txt"
        if requirements.exists():
            try:
                subprocess.run(
                    [sys.executable, "-m", "pip", "install", "--no-cache-dir",
                     "-r", str(requirements)],
                    check=True, capture_output=True, timeout=600,
                )
            except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
                log.error("Dependency install failed for %s: %s", version, exc)
                shutil.rmtree(dest, ignore_errors=True)
                return False

        # Atomic symlink swap: build a temp link, rename over `current`.
        current = self.cfg.app_dir
        tmp_link = current.with_name(f".{current.name}.new")
        try:
            tmp_link.unlink(missing_ok=True)
            os.symlink(dest, tmp_link)
            os.replace(tmp_link, current)
        except OSError as exc:
            log.error("Cannot activate release %s: %s", version, exc)
            tmp_link.unlink(missing_ok=True)
            return False

        log.info("Release %s activated", version)
        self._prune_releases()
        tarball.unlink(missing_ok=True)
        return True

    def _prune_releases(self) -> None:
        releases = sorted(
            (p for p in self.cfg.releases_dir.iterdir() if p.is_dir()),
            key=lambda p: parse_version(p.name),
            reverse=True,
        )
        for old in releases[KEEP_RELEASES:]:
            # Never remove the release the symlink currently points at.
            try:
                if self.cfg.app_dir.resolve() == old.resolve():
                    continue
            except OSError:
                pass
            shutil.rmtree(old, ignore_errors=True)

    # ─── Full cycle ───────────────────────────────────────────────────
    def run_once(self) -> bool:
        """Check + download + apply. Returns True if a restart is pending."""
        release = self.check()
        if not release:
            return False
        tarball = self.download(release)
        if tarball is None:
            return False
        if not self.apply(tarball, release["version"]):
            return False
        self.restart_requested.set()
        return True

    # ─── Worker loop ──────────────────────────────────────────────────
    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(
            target=self._run, name="ota-updater", daemon=True
        )
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=10)

    def _run(self) -> None:
        # Give the agent a minute to settle before the first check.
        if self._stop.wait(60):
            return
        while not self._stop.is_set():
            try:
                if self.run_once():
                    return  # main will stop services and re-exec
            except Exception:
                log.exception("OTA cycle failed")
            self._stop.wait(self.cfg.update_interval)

    # ─── Rollback ─────────────────────────────────────────────────────
    def rollback(self) -> str | None:
        """Point ``current`` at the previous release. Returns its version."""
        releases = sorted(
            (p for p in self.cfg.releases_dir.iterdir() if p.is_dir()),
            key=lambda p: parse_version(p.name),
            reverse=True,
        )
        try:
            active = self.cfg.app_dir.resolve()
        except OSError:
            active = None
        for candidate in releases:
            if active is not None and candidate.resolve() == active:
                continue
            current = self.cfg.app_dir
            tmp_link = current.with_name(f".{current.name}.new")
            tmp_link.unlink(missing_ok=True)
            os.symlink(candidate, tmp_link)
            os.replace(tmp_link, current)
            log.info("Rolled back to %s", candidate.name)
            return candidate.name
        log.warning("No previous release available for rollback")
        return None
