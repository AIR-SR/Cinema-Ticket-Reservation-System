from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings

DATABASE_URLS = {
    "global": settings.DATABASE_URL_GLOBAL,
    "krakow": settings.DATABASE_URL_KRAKOW,
    "warsaw": settings.DATABASE_URL_WARSAW
}


engines = {name: create_async_engine(url, echo=True) for name, url in DATABASE_URLS.items()}
sessions = {name: sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession, expire_on_commit=False) for name, engine in engines.items()}

Base = declarative_base()


async def get_db(region: str):
    """Returns an async database session for the specified region."""
    if region not in sessions:
        raise ValueError(f"Invalid region: {region}")
    async with sessions[region]() as session:
        yield session

