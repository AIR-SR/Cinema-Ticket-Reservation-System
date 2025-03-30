from pydantic_settings import BaseSettings, SettingsConfigDict


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
    ACCESS_TOKEN_EXPIRE_MINUTES: int

settings = Settings()