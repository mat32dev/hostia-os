"""Shared pytest fixtures: in-memory DB, mocked models, TestClient."""

import os
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# Environment must be set before any src.* import (settings are cached).
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("USE_MOCK_MODELS", "true")
os.environ.setdefault("STORAGE_BACKEND", "local")
os.environ.setdefault("LOCAL_STORAGE_DIR", "/tmp/guard_test_storage")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/15")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.db import Base, get_db
from src.main import app

test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=test_engine, autocommit=False, autoflush=False)


@pytest.fixture()
def db_session():
    """A fresh in-memory database per test."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def client(db_session):
    """FastAPI TestClient with the DB dependency overridden."""
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
