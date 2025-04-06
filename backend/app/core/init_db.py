import asyncio

from sqlalchemy.ext.asyncio import create_async_engine

from .config import settings
from .database import GlobalBase, LocalBase, engines


async def init_db():
    """Creates tables for global and local databases asynchronously."""
    # Initialize global database
    global_engine = engines["global"]
    async with global_engine.begin() as conn:
        print("Creating tables for global database...")
        # print("GlobalBase metadata tables:", GlobalBase.metadata.tables.keys())  # Debugging metadata
        await conn.run_sync(GlobalBase.metadata.create_all)
        print("Tables global created successfully.")
    await global_engine.dispose()

    # Initialize local databases
    for region in ["krakow", "warsaw"]:
        local_engine = engines[region]
        async with local_engine.begin() as conn:
            print(f"Creating tables for {region} database...")
            # print("LocalBase metadata tables:", LocalBase.metadata.tables.keys())  # Debugging metadata
            await conn.run_sync(LocalBase.metadata.create_all)
            print(f"Tables {region} created successfully.")
        await local_engine.dispose()

async def init_db_on_startup():
    """Initialize the database during app startup."""
    await init_db()