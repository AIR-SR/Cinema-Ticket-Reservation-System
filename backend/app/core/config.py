import logging
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("uvicorn")
logger.setLevel(logging.INFO)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env"
    )

    DATABASE_URL_GLOBAL: str
    DATABASE_URL_KRAKOW: str
    DATABASE_URL_WARSAW: str
    FRONTEND_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    # SENDGRID_API_KEY: str
    TMDB_API_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ROLE_ADMIN: str
    ROLE_USER: str
    ROLE_EMPLOYEE: str

settings = Settings(ROLE_ADMIN="admin",
                   ROLE_USER="user",
                   ROLE_EMPLOYEE="employee")