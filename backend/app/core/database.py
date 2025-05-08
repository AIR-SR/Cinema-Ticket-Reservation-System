from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings

# Separate Base objects for global and local models
GlobalBase = declarative_base()
LocalBase = declarative_base()

# Database URLs
DATABASE_URLS = {
    "global": settings.DATABASE_URL_GLOBAL,
    "krakow": settings.DATABASE_URL_KRAKOW,
    "warsaw": settings.DATABASE_URL_WARSAW,
}

# Engines for global and local databases
engines = {
    "global": create_async_engine(DATABASE_URLS["global"], echo=False),
    "krakow": create_async_engine(DATABASE_URLS["krakow"], echo=False),
    "warsaw": create_async_engine(DATABASE_URLS["warsaw"], echo=False),
}

# Session makers for global and local databases
sessions = {
    "global": sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engines["global"],
        class_=AsyncSession,
        expire_on_commit=False,
    ),
    "krakow": sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engines["krakow"],
        class_=AsyncSession,
        expire_on_commit=False,
    ),
    "warsaw": sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engines["warsaw"],
        class_=AsyncSession,
        expire_on_commit=False,
    ),
}


async def get_db_local(region: str):
    """Returns an async database session for the specified region."""
    if region not in sessions:  # Fix region validation logic
        raise ValueError(f"Invalid region: {region}")
    async with sessions[region]() as session:
        yield session


async def get_db_global():
    """Returns an async database session for the global database."""
    async with sessions["global"]() as session:
        yield session
