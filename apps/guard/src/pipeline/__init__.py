"""Pipeline registry.

Each stage of the Guard pipeline is a pluggable component. Heavy ML
dependencies (torch, ultralytics, transformers, opencv) are imported lazily
inside the components so that importing the registry (or the API app) never
pulls them in.

Stages run in ``PIPELINE_STAGES`` order inside the Celery worker:
extractor -> detector -> analyzer -> matcher -> alerter
(feedback and storage are cross-cutting services).
"""

import importlib
from typing import Any, Dict, Optional, Tuple, Type

from ..config import Settings, get_settings

_REGISTRY: Dict[str, Tuple[str, str]] = {
    "extractor": ("extractor", "FrameExtractor"),
    "detector": ("detector", "CashDetector"),
    "analyzer": ("analyzer", "VLMAnalyzer"),
    "matcher": ("matcher", "PaymentMatcher"),
    "alerter": ("alerter", "Alerter"),
    "feedback": ("feedback", "FeedbackService"),
    "storage": ("storage", "StorageService"),
}

PIPELINE_STAGES = ["extractor", "detector", "analyzer", "matcher", "alerter"]

# Singletons for the expensive models (shared across tasks in a worker).
_SINGLETONS: Dict[str, Any] = {}


def available_components() -> Dict[str, str]:
    """Return the registered component names and their implementing classes."""
    return {name: f"{mod}.{cls}" for name, (mod, cls) in _REGISTRY.items()}


def get_component_class(name: str) -> Type:
    """Lazily import and return the class implementing a pipeline stage."""
    if name not in _REGISTRY:
        raise KeyError(
            f"Unknown pipeline component {name!r}. "
            f"Available: {sorted(_REGISTRY)}"
        )
    module_name, class_name = _REGISTRY[name]
    module = importlib.import_module(f".{module_name}", package=__name__)
    return getattr(module, class_name)


def create_component(name: str, settings: Optional[Settings] = None) -> Any:
    """Instantiate a pipeline component with the given settings."""
    cls = get_component_class(name)
    return cls(settings or get_settings())


def get_detector(settings: Optional[Settings] = None) -> Any:
    """Process-wide shared object detector (loads YOLO weights once)."""
    if "detector" not in _SINGLETONS:
        _SINGLETONS["detector"] = create_component("detector", settings)
    return _SINGLETONS["detector"]


def get_analyzer(settings: Optional[Settings] = None) -> Any:
    """Process-wide shared VLM analyzer (loads SmolVLM2 weights once)."""
    if "analyzer" not in _SINGLETONS:
        _SINGLETONS["analyzer"] = create_component("analyzer", settings)
    return _SINGLETONS["analyzer"]


def model_status(settings: Optional[Settings] = None) -> Dict[str, Dict[str, Any]]:
    """Report model configuration and load state without forcing a load."""
    settings = settings or get_settings()
    detector = _SINGLETONS.get("detector")
    analyzer = _SINGLETONS.get("analyzer")
    return {
        "yolo": {
            "loaded": bool(getattr(detector, "model_loaded", False)),
            "model": settings.yolo_model_path,
            "device": settings.resolved_device,
            "mock": settings.use_mock_models,
        },
        "vlm": {
            "loaded": bool(getattr(analyzer, "model_loaded", False)),
            "model": settings.vlm_model_name,
            "device": settings.resolved_device,
            "mock": settings.use_mock_models,
        },
    }


def reset_singletons() -> None:
    """Drop cached model singletons (used by tests)."""
    _SINGLETONS.clear()
