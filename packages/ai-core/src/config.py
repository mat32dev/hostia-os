import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM
    OPENAI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    DIRECTOR_MODEL: str = "gpt-4o-mini"
    AGENT_MODEL: str = "gpt-4o-mini"

    # Services
    POS_API_URL: str = "http://pos-api:8000"
    GUARD_API_URL: str = "http://guard-api:8002"
    CHAT_API_URL: str = "http://chat-api:3001"

    # Memory
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""
    REDIS_URL: str = "redis://localhost:6379"

    # WhatsApp
    WA_PHONE_ID: str = ""
    WA_ACCESS_TOKEN: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
