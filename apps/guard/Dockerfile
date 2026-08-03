# ─────────────────────────────────────────────────────────────────────────────
# Host.ia Guard — production image with GPU support (CUDA 12.4).
#
# The base image ships PyTorch with CUDA, so requirements.txt reuses the
# preinstalled torch/torchvision. For CPU-only deployments swap the base
# image for `python:3.12-slim` (torch wheels will install in CPU mode).
#
# Run the API:     (default CMD below)
# Run the worker:  docker run --gpus all <image> \
#                    celery -A src.main.celery_app worker --loglevel=info --concurrency=2
# With docker-compose: add `deploy.resources.reservations.devices` (nvidia)
# or use `--gpus all` with plain docker run.
# ─────────────────────────────────────────────────────────────────────────────
FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/home/guard/.cache/huggingface \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# System dependencies: FFmpeg (frame extraction) + OpenCV runtime libs.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies (torch/torchvision already in the base image).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code.
COPY src ./src
COPY public ./public

# Non-root runtime user + writable caches (HuggingFace, torch, storage).
RUN useradd --create-home --shell /bin/bash guard \
    && mkdir -p /home/guard/.cache/huggingface /app/data /app/models \
    && chown -R guard:guard /app /home/guard
USER guard

ENV PYTHONPATH=/app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request,sys;sys.exit(0 if urllib.request.urlopen('http://localhost:8000/health').status==200 else 1)"

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
