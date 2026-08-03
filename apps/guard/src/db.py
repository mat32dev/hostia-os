"""Database engine, session factory and FastAPI dependency."""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import get_settings

settings = get_settings()

_connect_args = (
    {"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {}
)

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    connect_args=_connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a scoped session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables. Safe to call repeatedly."""
    from . import models  # noqa: F401  (register models on metadata)

    Base.metadata.create_all(bind=engine)
