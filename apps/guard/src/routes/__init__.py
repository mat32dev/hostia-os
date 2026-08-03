"""Route registry — wires all API routers into the FastAPI app."""

from fastapi import APIRouter, FastAPI

from . import alerts, feedback, reports, videos

api_router = APIRouter()
api_router.include_router(videos.router)
api_router.include_router(alerts.router)
api_router.include_router(reports.router)
api_router.include_router(feedback.router)


def register_routes(app: FastAPI, prefix: str = "/v1") -> None:
    app.include_router(api_router, prefix=prefix)
