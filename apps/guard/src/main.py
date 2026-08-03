"""Host.ia Guard — FastAPI application entry point.

AI security analyst that monitors cash transactions on video:
YOLO detection + SmolVLM2 scene analysis + POS matching + alerts + RLHF.
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from . import __version__, schemas
from .celery_app import celery_app  # noqa: F401  (exposed for `celery -A src.main.celery_app`)
from .config import get_settings
from .db import engine, init_db
from .pipeline import model_status
from .pipeline.storage import get_storage
from .routes import register_routes

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Database
    try:
        init_db()
        logger.info("database ready (%s)", settings.database_url.split("@")[-1])
    except Exception:
        logger.exception("database initialization failed")
    # Object storage
    try:
        get_storage(settings).ensure_buckets()
        logger.info("storage ready (%s backend)", settings.storage_backend)
    except Exception:
        logger.warning("storage initialization failed", exc_info=True)
    yield


app = FastAPI(
    title="Host.ia Guard API",
    description="AI security analyst for hospitality — video monitoring of cash transactions.",
    version=__version__,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()] or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routes(app, prefix=settings.api_prefix)


@app.get("/health", response_model=schemas.HealthResponse)
def health():
    """Service health: database, queue, storage and model status."""
    checks: dict = {}

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        checks["database"] = {"status": "ok"}
    except Exception as exc:
        checks["database"] = {"status": "error", "detail": str(exc)[:200]}

    try:
        import redis

        redis.Redis.from_url(settings.redis_url, socket_timeout=1).ping()
        checks["queue"] = {"status": "ok"}
    except Exception as exc:
        checks["queue"] = {"status": "error", "detail": str(exc)[:200]}

    try:
        ok = get_storage(settings).health()
        checks["storage"] = {
            "status": "ok" if ok else "error",
            "backend": settings.storage_backend,
        }
    except Exception as exc:
        checks["storage"] = {"status": "error", "detail": str(exc)[:200]}

    checks["models"] = model_status(settings)

    degraded = checks["database"]["status"] != "ok"
    return schemas.HealthResponse(
        status="degraded" if degraded else "ok",
        version=__version__,
        checks=checks,
    )


@app.get("/")
def root():
    return {
        "service": "guard",
        "version": __version__,
        "docs": "/docs",
        "health": "/health",
    }


# Serve the dashboard (if present) — mounted last so API routes win.
_PUBLIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
if os.path.isdir(_PUBLIC_DIR):
    app.mount("/dashboard", StaticFiles(directory=_PUBLIC_DIR, html=True), name="dashboard")
