"""Video upload and processing-status endpoints."""

import logging
import os
import tempfile
import uuid
from datetime import datetime
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from .. import schemas
from ..config import get_settings
from ..db import get_db
from ..models import Alert, AnalysisResult, Video, VideoStatus
from ..pipeline.storage import get_storage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/videos", tags=["videos"])

ALLOWED_CONTENT_TYPES = {
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/webm",
    "video/mpeg",
    "application/octet-stream",  # some cameras don't send a proper type
}

_PROGRESS = {
    VideoStatus.PENDING: 0.0,
    VideoStatus.PROCESSING: 0.5,
    VideoStatus.COMPLETED: 1.0,
    VideoStatus.FAILED: 0.0,
}


def dispatch_processing(video_id: str) -> str:
    """Enqueue the Celery task. Imported lazily so the API can boot
    without a live broker; call sites handle failures gracefully."""
    from ..celery_app import process_video

    result = process_video.delay(video_id)
    return result.id or ""


def _video_response(db: Session, video: Video) -> schemas.VideoResponse:
    response = schemas.VideoResponse.model_validate(video)
    response.analysis_count = (
        db.query(AnalysisResult).filter(AnalysisResult.video_id == video.id).count()
    )
    response.alert_count = db.query(Alert).filter(Alert.video_id == video.id).count()
    return response


@router.post(
    "/upload",
    response_model=schemas.VideoUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_video(
    file: UploadFile = File(...),
    tenant_id: int = Form(1),
    camera_id: str = Form("default"),
    recorded_at: Optional[datetime] = Form(None),
    db: Session = Depends(get_db),
):
    """Accept a video upload (multipart/form-data) and queue analysis."""
    settings = get_settings()

    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported content type: {file.content_type}",
        )

    safe_name = os.path.basename(file.filename or "upload.mp4").replace(" ", "_")
    suffix = os.path.splitext(safe_name)[1] or ".mp4"

    # Stream to a temp file while enforcing the size limit.
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix, prefix="guard_upload_")
    size = 0
    try:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > settings.max_upload_bytes:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Video exceeds {settings.max_upload_mb} MB limit",
                )
            tmp.write(chunk)
        tmp.close()

        if size == 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Empty file",
            )

        storage = get_storage()
        storage_key = f"{tenant_id}/{uuid.uuid4().hex}_{safe_name}"
        storage.upload_video(tmp.name, storage_key)
    finally:
        os.unlink(tmp.name)

    video = Video(
        tenant_id=tenant_id,
        camera_id=camera_id,
        filename=safe_name,
        content_type=file.content_type,
        size_bytes=size,
        storage_key=storage_key,
        recorded_at=recorded_at,
        status=VideoStatus.PENDING,
    )
    db.add(video)
    db.commit()
    db.refresh(video)

    task_id: Optional[str] = None
    try:
        task_id = dispatch_processing(video.id)
        video.celery_task_id = task_id
        db.commit()
    except Exception:
        logger.exception(
            "Could not enqueue processing for video %s (broker down?); "
            "video stays pending and can be reprocessed",
            video.id,
        )

    return schemas.VideoUploadResponse(
        id=video.id,
        filename=video.filename,
        status=video.status,
        celery_task_id=task_id,
    )


@router.get("", response_model=schemas.VideoListResponse)
def list_videos(
    tenant_id: int = Query(1),
    camera_id: Optional[str] = Query(None),
    status_filter: Optional[VideoStatus] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Video).filter(Video.tenant_id == tenant_id)
    if camera_id:
        query = query.filter(Video.camera_id == camera_id)
    if status_filter:
        query = query.filter(Video.status == status_filter)
    total = query.count()
    videos = (
        query.order_by(Video.uploaded_at.desc()).offset(offset).limit(limit).all()
    )
    return schemas.VideoListResponse(
        total=total, items=[_video_response(db, v) for v in videos]
    )


def _get_video_or_404(db: Session, video_id: str) -> Video:
    video = db.get(Video, video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.get("/{video_id}", response_model=schemas.VideoResponse)
def get_video(video_id: str, db: Session = Depends(get_db)):
    return _video_response(db, _get_video_or_404(db, video_id))


@router.get("/{video_id}/status", response_model=schemas.VideoStatusResponse)
def get_video_status(video_id: str, db: Session = Depends(get_db)):
    video = _get_video_or_404(db, video_id)
    return schemas.VideoStatusResponse(
        id=video.id,
        status=video.status,
        progress=_PROGRESS.get(video.status, 0.0),
        celery_task_id=video.celery_task_id,
        error=video.error,
        processed_at=video.processed_at,
    )


@router.get(
    "/{video_id}/results", response_model=list[schemas.AnalysisResultResponse]
)
def get_video_results(video_id: str, db: Session = Depends(get_db)):
    _get_video_or_404(db, video_id)
    return (
        db.query(AnalysisResult)
        .filter(AnalysisResult.video_id == video_id)
        .order_by(AnalysisResult.timestamp_s)
        .all()
    )


@router.post(
    "/{video_id}/reprocess",
    response_model=schemas.VideoStatusResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def reprocess_video(video_id: str, db: Session = Depends(get_db)):
    """Re-queue a video (e.g. after a failure or a model update)."""
    video = _get_video_or_404(db, video_id)
    if video.status == VideoStatus.PROCESSING:
        raise HTTPException(status_code=409, detail="Video is already processing")
    video.status = VideoStatus.PENDING
    video.error = None
    try:
        video.celery_task_id = dispatch_processing(video.id)
    except Exception as exc:
        db.commit()  # keep the pending state even if the broker is down
        raise HTTPException(
            status_code=503, detail=f"Processing queue unavailable: {exc}"
        )
    db.commit()
    return schemas.VideoStatusResponse(
        id=video.id,
        status=video.status,
        progress=0.0,
        celery_task_id=video.celery_task_id,
        error=None,
        processed_at=video.processed_at,
    )
