import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from models import Base  # Import your SQLAlchemy models
from .config import settings

# Database connection URLs
DATABASE_URLS = {
    "global": settings.DATABASE_URL_GLOBAL,
    "krakow": settings.DATABASE_URL_KRAKOW,
    "warsaw": settings.DATABASE_URL_WARSAW
}

async def init_db():
    """Creates tables for all databases asynchronously."""
    for region, db_url in DATABASE_URLS.items():
        engine = create_async_engine(db_url, echo=True)
        async with engine.begin() as conn:
            print(f"Creating tables for {region} database...")
            await conn.run_sync(Base.metadata.create_all)
        await engine.dispose()  # Close the engine after execution

if __name__ == "__main__":
    asyncio.run(init_db())  # Run this manually