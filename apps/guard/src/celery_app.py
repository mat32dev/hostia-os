"""Celery application and the async video-processing task.

``process_video`` runs the full pipeline for one uploaded video:

    extract frames (FFmpeg, activity-filtered)
      -> YOLO detection (hands/people/cash/POS)
        -> VLM event analysis (SmolVLM2, structured JSON)
          -> persist AnalysisResult rows + keyframes
            -> match against expected POS payments
              -> generate alerts with severity
"""

import os
import shutil
import tempfile
from datetime import datetime, timedelta

from celery import Celery
from celery.utils.log import get_task_logger

from .config import get_settings
from .db import SessionLocal
from .models import (
    AnalysisResult,
    ExpectedPayment,
    MatchScenario,
    PaymentStatus,
    Video,
    VideoStatus,
)
from .pipeline import create_component, get_analyzer, get_detector
from .pipeline.alerter import Alerter
from .pipeline.feedback import FeedbackService
from .pipeline.matcher import AnalyzedEvent, PaymentMatcher
from .pipeline.storage import get_storage

logger = get_task_logger(__name__)

settings = get_settings()

celery_app = Celery(
    "guard",
    broker=settings.broker_url,
    backend=settings.result_backend,
    include=["src.celery_app"],
)
celery_app.conf.update(
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_time_limit=1800,  # 30 min hard cap per video
    task_soft_time_limit=1500,
    result_expires=3600,
    timezone="UTC",
)


@celery_app.task(bind=True, max_retries=2, default_retry_delay=30)
def process_video(self, video_id: str):
    """Run the full analysis pipeline for an uploaded video."""
    db = SessionLocal()
    tmpdir = tempfile.mkdtemp(prefix="guard_")
    video = None
    try:
        video = db.get(Video, video_id)
        if video is None:
            logger.error("process_video: video %s not found", video_id)
            return {"status": "not_found", "video_id": video_id}

        video.status = VideoStatus.PROCESSING
        video.celery_task_id = self.request.id
        video.error = None
        db.commit()

        # 1. Download footage
        storage = get_storage(settings)
        local_path = os.path.join(tmpdir, os.path.basename(video.filename) or f"{video.id}.mp4")
        storage.download_video(video.storage_key, local_path)

        # 2. Extract activity-filtered frames
        extractor = create_component("extractor", settings)
        extraction = extractor.extract(local_path, work_dir=os.path.join(tmpdir, "frames"))
        video.duration_s = extraction.duration_s

        # 3. YOLO detection -> cash events
        detector = get_detector(settings)
        frame_detections = detector.detect_frames(extraction.frames)
        events = detector.build_events(frame_detections)

        # 4. VLM analysis per event
        analyzer = get_analyzer(settings)
        analyzed = [
            AnalyzedEvent(event=event, vlm=analyzer.analyze_event(event))
            for event in events
        ]

        # 5. Persist analysis results + keyframes
        analysis_index = {}
        for ae in analyzed:
            peak = ae.event.peak_frame
            frame_key = f"{video.tenant_id}/{video.id}/frame_{peak.frame.index:06d}.jpg"
            storage.upload_frame(peak.frame.path, frame_key)
            result = AnalysisResult(
                tenant_id=video.tenant_id,
                video_id=video.id,
                camera_id=video.camera_id,
                frame_index=peak.frame.index,
                timestamp_s=ae.event.peak_s,
                frame_storage_key=frame_key,
                detections=ae.event.to_dict(),
                vlm_output=ae.vlm.model_dump(),
                cash_detected=bool(
                    ae.vlm.cash_visible
                    or ae.event.cash_confidence >= settings.min_event_confidence
                ),
                cash_amount_est=ae.vlm.cash_amount_estimate,
                transaction_detected=bool(ae.vlm.transaction_occurred),
                drawer_open=bool(ae.vlm.drawer_open or ae.event.drawer_open),
                pos_screen_visible=bool(
                    ae.vlm.pos_screen_visible or ae.event.pos_screen_visible
                ),
                people_count=ae.vlm.people_count or ae.event.people_count,
                suspicious_behavior=bool(ae.vlm.suspicious_behavior),
                confidence=round(max(ae.vlm.confidence, ae.event.confidence), 4),
                notes=ae.vlm.behavior_notes or None,
            )
            db.add(result)
            db.flush()
            analysis_index[id(ae.event)] = result

        # 6. Match against expected POS payments
        reference_time = video.recorded_at or video.uploaded_at
        window = timedelta(seconds=float(settings.match_window_seconds))
        span_end = reference_time + timedelta(seconds=video.duration_s or 0) + window
        payments = (
            db.query(ExpectedPayment)
            .filter(
                ExpectedPayment.tenant_id == video.tenant_id,
                ExpectedPayment.expected_at >= reference_time - window,
                ExpectedPayment.expected_at <= span_end,
                ExpectedPayment.status == PaymentStatus.PENDING,
            )
            .all()
        )

        adjustment = FeedbackService(settings).confidence_adjustment(db, video.tenant_id)
        matcher = PaymentMatcher(settings)
        matches = matcher.match(
            analyzed, payments, reference_time, confidence_adjustment=adjustment
        )

        # 7. Persist match outcomes
        for match in matches:
            result = (
                analysis_index.get(id(match.event.event)) if match.event else None
            )
            if result is not None:
                result.match_scenario = match.scenario
            if match.payment is not None:
                if match.scenario in (MatchScenario.VERIFIED, MatchScenario.UNVERIFIED):
                    match.payment.status = PaymentStatus.MATCHED
                    if result is not None:
                        match.payment.matched_result_id = result.id
                elif match.scenario == MatchScenario.QUIET:
                    match.payment.status = PaymentStatus.UNMATCHED

        # 8. Alerts
        alerter = Alerter(settings)
        alerts = alerter.create_alerts(
            db, video=video, matches=matches, analysis_index=analysis_index
        )

        video.status = VideoStatus.COMPLETED
        video.processed_at = datetime.utcnow()
        db.commit()
        extractor.cleanup(extraction)

        summary = {
            "video_id": video_id,
            "status": "completed",
            "frames_kept": len(extraction.frames),
            "frames_sampled": extraction.total_sampled,
            "events": len(analyzed),
            "matches": {s.value: sum(1 for m in matches if m.scenario == s) for s in MatchScenario},
            "alerts": len(alerts),
        }
        logger.info("process_video %s: %s", video_id, summary)
        return summary

    except Exception as exc:
        db.rollback()
        logger.exception("process_video %s failed", video_id)
        try:
            video = db.get(Video, video_id)
            if video is not None:
                if self.request.retries >= self.max_retries:
                    video.status = VideoStatus.FAILED
                    video.error = str(exc)[:2000]
                else:
                    video.status = VideoStatus.PENDING  # will be retried
                db.commit()
        finally:
            pass
        raise self.retry(exc=exc)

    finally:
        db.close()
        shutil.rmtree(tmpdir, ignore_errors=True)
