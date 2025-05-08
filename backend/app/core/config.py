import logging
from pydantic_settings import BaseSettings, SettingsConfigDict

# Configure logger
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.INFO)

# Add a console handler if not already present
if not logger.handlers:
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

# Set SQLAlchemy engine logging level
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

# Test logger output
logger.info("Logger is configured and working.")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../../../.env")

    DATABASE_URL_GLOBAL: str
    DATABASE_URL_KRAKOW: str
    DATABASE_URL_WARSAW: str
    ADMIN_PASSWORD: str
    FRONTEND_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    # SENDGRID_API_KEY: str
    REACT_APP_API_URL: str
    TMDB_API_URL: str
    TMDB_API_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ROLE_ADMIN: str
    ROLE_USER: str
    ROLE_EMPLOYEE: str


settings = Settings()
