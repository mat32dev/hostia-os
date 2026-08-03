"""Pydantic schemas (request/response contracts) for the Guard API."""

from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

from .models import (
    AlertStatus,
    AlertType,
    FeedbackLabel,
    MatchScenario,
    PaymentStatus,
    Severity,
    VideoStatus,
)


# ─── Videos ───
class VideoUploadResponse(BaseModel):
    id: str
    filename: str
    status: VideoStatus
    celery_task_id: Optional[str] = None
    message: str = "Video queued for analysis"


class VideoStatusResponse(BaseModel):
    id: str
    status: VideoStatus
    progress: float = 0.0
    celery_task_id: Optional[str] = None
    error: Optional[str] = None
    processed_at: Optional[datetime] = None


class VideoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: int
    camera_id: str
    filename: str
    content_type: Optional[str] = None
    size_bytes: int = 0
    duration_s: Optional[float] = None
    recorded_at: Optional[datetime] = None
    status: VideoStatus
    error: Optional[str] = None
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    analysis_count: int = 0
    alert_count: int = 0


class VideoListResponse(BaseModel):
    total: int
    items: List[VideoResponse]


# ─── Analysis results ───
class AnalysisResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    video_id: str
    camera_id: str
    frame_index: int
    timestamp_s: float
    frame_storage_key: Optional[str] = None
    cash_detected: bool
    cash_amount_est: Optional[float] = None
    transaction_detected: bool
    drawer_open: bool
    pos_screen_visible: bool
    people_count: int
    suspicious_behavior: bool
    confidence: float
    match_scenario: Optional[MatchScenario] = None
    notes: Optional[str] = None
    created_at: datetime


# ─── Expected payments ───
class ExpectedPaymentCreate(BaseModel):
    """Payload sent by the POS agent when a sale is registered."""

    tenant_id: int = 1
    transaction_id: str
    amount: float = Field(gt=0)
    table_number: Optional[int] = None
    timestamp: datetime  # POS sale time (kept as "timestamp" for POS-agent compat)
    payment_method: str = "cash"
    window_minutes: int = Field(default=5, ge=1, le=60)
    register_id: str = "default"


class ExpectedPaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    transaction_id: str
    register_id: str
    amount: float
    table_number: Optional[int] = None
    payment_method: str
    expected_at: datetime
    window_seconds: int
    status: PaymentStatus
    matched_result_id: Optional[int] = None
    created_at: datetime


# ─── Alerts ───
class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    alert_type: AlertType
    severity: Severity
    status: AlertStatus
    title: str
    description: str = ""
    camera_id: str
    video_id: Optional[str] = None
    analysis_result_id: Optional[int] = None
    expected_payment_id: Optional[int] = None
    amount: Optional[float] = None
    expected_amount: Optional[float] = None
    event_timestamp: Optional[datetime] = None
    confidence: float = 0.0
    extra_data: dict = Field(default_factory=dict)
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    created_at: datetime


class AlertListResponse(BaseModel):
    total: int
    items: List[AlertResponse]


class AlertUpdate(BaseModel):
    status: AlertStatus
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = None


class AlertResolution(BaseModel):
    """Backwards-compatible payload used by the dashboard (POST .../resolve)."""

    status: AlertStatus
    notes: Optional[str] = None
    resolved_by: Optional[str] = None


# ─── Feedback (RLHF) ───
class FeedbackCreate(BaseModel):
    tenant_id: int = 1
    alert_id: int
    label: FeedbackLabel
    notes: Optional[str] = None
    created_by: Optional[str] = None


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    alert_id: int
    label: FeedbackLabel
    notes: Optional[str] = None
    created_by: Optional[str] = None
    applied: bool
    created_at: datetime


class FeedbackStats(BaseModel):
    total: int
    true_positives: int
    false_positives: int
    uncertain: int
    precision: Optional[float] = None
    precision_by_type: Dict[str, Optional[float]] = Field(default_factory=dict)
    confidence_adjustment: float = 0.0


# ─── Reports ───
class ScenarioCounts(BaseModel):
    verified: int = 0
    unverified: int = 0
    unregistered: int = 0
    quiet: int = 0


class ReportSummary(BaseModel):
    tenant_id: int
    date_from: datetime
    date_to: datetime
    videos_processed: int
    events_detected: int
    scenarios: ScenarioCounts
    match_rate: Optional[float] = None
    alerts_total: int
    alerts_by_severity: Dict[str, int] = Field(default_factory=dict)
    alerts_by_type: Dict[str, int] = Field(default_factory=dict)
    open_alerts: int = 0
    amount_at_risk: float = 0.0  # sum of unregistered transaction estimates
    currency: str = "EUR"


class DailyReport(BaseModel):
    date: str
    total_frames_analyzed: int
    suspicious_activities: int
    alerts: List[AlertResponse]
    expected_payments_matched: int
    discrepancies: int


# ─── Health ───
class ModelStatus(BaseModel):
    loaded: bool
    model: str
    device: str
    mock: bool


class HealthResponse(BaseModel):
    status: str
    service: str = "guard"
    version: str
    checks: Dict[str, object] = Field(default_factory=dict)
