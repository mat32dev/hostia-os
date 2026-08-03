"""Application settings, loaded from environment variables / .env file."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ─── App ───
    APP_NAME: str = "Host.ia POS"
    ENVIRONMENT: str = "development"  # development | staging | production
    API_V1_PREFIX: str = "/v1"
    CORS_ORIGINS: str = "*"  # comma-separated list, or "*"

    # ─── Database ───
    DATABASE_URL: str = "postgresql://hostia:hostia_dev@localhost:5432/hostia_os"
    DB_ECHO: bool = False
    # Create tables on startup (dev convenience). Disable in production
    # and manage the schema with Alembic migrations instead.
    AUTO_CREATE_TABLES: bool = True

    # ─── Cache / queue ───
    REDIS_URL: str = "redis://localhost:6379/0"

    # ─── Auth / JWT ───
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # ─── Integrations (Host.ia platform) ───
    CHAT_API_URL: str = "http://chat-api:3001"
    GUARD_API_URL: str = "http://guard-api:8000"
    INTEGRATIONS_ENABLED: bool = True
    INTEGRATION_TIMEOUT: float = 5.0  # seconds
    # Minutes Guard watches the cash drawer after a cash payment.
    GUARD_CASH_WINDOW_MINUTES: int = 10

    # ─── Payments ───
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # ─── Business defaults ───
    DEFAULT_TAX_RATE: float = 10.0  # % applied when a tenant has no rate set

    @property
    def cors_origins_list(self) -> list[str]:
        """CORS_ORIGINS parsed as a list (comma-separated in the env var)."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
