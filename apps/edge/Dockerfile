# Host.ia Edge — multi-arch image (linux/amd64 + linux/arm64 for Pi 5).
# Build for ARM64:  docker buildx build --platform linux/arm64 -t hostia/edge .
FROM python:3.12-slim

WORKDIR /app

# OpenCV runtime libs + tools for camera debugging (v4l2-ctl) and OTA health checks.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
    v4l-utils \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src ./src
COPY tests ./tests

# Persistent state (SQLite + 24h video buffer + OTA releases) lives on a volume.
ENV DATA_DIR=/data \
    APP_DIR=/app \
    CAMERA_ENABLED=true \
    PYTHONUNBUFFERED=1
VOLUME ["/data"]

# Local offline POS API.
EXPOSE 8090

HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -fsS http://localhost:8090/healthz || exit 1

CMD ["python", "-m", "src.main"]
