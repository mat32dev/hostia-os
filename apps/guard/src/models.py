"""SQLAlchemy models for Host.ia Guard.

Domain model:

- ``Video``: an uploaded footage chunk from a register camera.
- ``AnalysisResult``: a detected + VLM-analyzed cash event inside a video.
- ``ExpectedPayment``: a POS-registered sale the video should confirm.
- ``Alert``: a discrepancy raised by the matcher/alerter.
- ``Feedback``: owner corrections used by the RLHF loop.
"""

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship

from .db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _enum_values(enum_cls):
    """Store enum *values* (lowercase) instead of member names in the DB."""
    return [member.value for member in enum_cls]


class VideoStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AlertType(str, Enum):
    UNREGISTERED_TRANSACTION = "unregistered_transaction"
    UNVERIFIED_TRANSACTION = "unverified_transaction"
    QUIET_POS = "quiet_pos"
    SUSPICIOUS_BEHAVIOR = "suspicious_behavior"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class MatchScenario(str, Enum):
    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    UNREGISTERED = "unregistered"
    QUIET = "quiet"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    MATCHED = "matched"
    UNMATCHED = "unmatched"


class FeedbackLabel(str, Enum):
    TRUE_POSITIVE = "true_positive"
    FALSE_POSITIVE = "false_positive"
    UNCERTAIN = "uncertain"


class Video(Base):
    __tablename__ = "videos"

    id = Column(String(36), primary_key=True, default=_uuid)
    tenant_id = Column(Integer, index=True, nullable=False, default=1)
    camera_id = Column(String(64), index=True, default="default")
    filename = Column(String(255), nullable=False)
    content_type = Column(String(128), nullable=True)
    size_bytes = Column(Integer, default=0)
    storage_key = Column(String(512), nullable=False)
    duration_s = Column(Float, nullable=True)
    recorded_at = Column(DateTime, nullable=True)  # footage capture time (POS alignment)
    status = Column(
        SAEnum(VideoStatus, values_callable=_enum_values),
        default=VideoStatus.PENDING,
        index=True,
    )
    error = Column(Text, nullable=True)
    celery_task_id = Column(String(64), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    analysis_results = relationship(
        "AnalysisResult", back_populates="video", cascade="all, delete-orphan"
    )
    alerts = relationship("Alert", back_populates="video")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, index=True, nullable=False, default=1)
    video_id = Column(String(36), ForeignKey("videos.id"), index=True)
    camera_id = Column(String(64), default="default")
    frame_index = Column(Integer, default=0)
    timestamp_s = Column(Float, default=0.0)
    frame_storage_key = Column(String(512), nullable=True)
    detections = Column(JSON, default=list)
    vlm_output = Column(JSON, default=dict)
    cash_detected = Column(Boolean, default=False)
    cash_amount_est = Column(Float, nullable=True)
    transaction_detected = Column(Boolean, default=False)
    drawer_open = Column(Boolean, default=False)
    pos_screen_visible = Column(Boolean, default=False)
    people_count = Column(Integer, default=0)
    suspicious_behavior = Column(Boolean, default=False)
    confidence = Column(Float, default=0.0)
    match_scenario = Column(
        SAEnum(MatchScenario, values_callable=_enum_values), nullable=True, index=True
    )
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    video = relationship("Video", back_populates="analysis_results")
    alerts = relationship("Alert", back_populates="analysis_result")


class ExpectedPayment(Base):
    __tablename__ = "expected_payments"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, index=True, nullable=False, default=1)
    transaction_id = Column(String(64), index=True)  # POS reference
    register_id = Column(String(64), default="default", index=True)
    amount = Column(Float, nullable=False)
    table_number = Column(Integer, nullable=True)
    payment_method = Column(String(16), default="cash", index=True)
    expected_at = Column(DateTime, index=True, nullable=False)
    window_seconds = Column(Integer, default=300)
    status = Column(
        SAEnum(PaymentStatus, values_callable=_enum_values),
        default=PaymentStatus.PENDING,
        index=True,
    )
    matched_result_id = Column(
        Integer, ForeignKey("analysis_results.id"), nullable=True
    )
    created_at = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, index=True, nullable=False, default=1)
    alert_type = Column(
        SAEnum(AlertType, values_callable=_enum_values), index=True, nullable=False
    )
    severity = Column(
        SAEnum(Severity, values_callable=_enum_values),
        default=Severity.MEDIUM,
        index=True,
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    camera_id = Column(String(64), default="default")
    video_id = Column(String(36), ForeignKey("videos.id"), nullable=True, index=True)
    analysis_result_id = Column(
        Integer, ForeignKey("analysis_results.id"), nullable=True
    )
    expected_payment_id = Column(
        Integer, ForeignKey("expected_payments.id"), nullable=True
    )
    amount = Column(Float, nullable=True)  # detected / estimated amount
    expected_amount = Column(Float, nullable=True)  # POS-registered amount
    event_timestamp = Column(DateTime, nullable=True)
    confidence = Column(Float, default=0.0)
    status = Column(
        SAEnum(AlertStatus, values_callable=_enum_values),
        default=AlertStatus.OPEN,
        index=True,
    )
    extra_data = Column("metadata", JSON, default=dict)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    video = relationship("Video", back_populates="alerts")
    analysis_result = relationship("AnalysisResult", back_populates="alerts")
    expected_payment = relationship("ExpectedPayment")
    feedback = relationship(
        "Feedback", back_populates="alert", cascade="all, delete-orphan"
    )


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, index=True, nullable=False, default=1)
    alert_id = Column(Integer, ForeignKey("alerts.id"), index=True, nullable=False)
    label = Column(SAEnum(FeedbackLabel, values_callable=_enum_values), nullable=False)
    notes = Column(Text, nullable=True)
    created_by = Column(String(128), nullable=True)
    applied = Column(Boolean, default=False)  # consumed by threshold tuning / export
    created_at = Column(DateTime, default=datetime.utcnow)

    alert = relationship("Alert", back_populates="feedback")
