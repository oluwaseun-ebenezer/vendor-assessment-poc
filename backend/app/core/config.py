from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://vendor_user:changeme@db:5432/vendor_assessment"
    postgres_user: str = "vendor_user"
    postgres_password: str = "changeme"
    postgres_db: str = "vendor_assessment"

    # Auth
    jwt_secret: str = "changeme"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # MCP service token (pre-generated long-lived token for MCP server)
    mcp_service_token: str = "mcp_service_token_change_this"

    # OpenRouter
    openrouter_api_key: str = ""
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "meta-llama/llama-3-8b-instruct:free"

    # Email (Mailhog)
    smtp_host: str = "mailhog"
    smtp_port: int = 1025
    email_from: str = "noreply@vendor-assessment.local"

    # External APIs
    nvd_api_key: str = ""
    companies_house_api_key: str = ""
    opencorporates_api_key: str = ""

    # App
    environment: str = "development"
    upload_dir: str = "/app/uploads"
    max_upload_size_mb: int = 20

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
