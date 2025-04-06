import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.sql import text

DATABASE_URLS = {
    "global": 'postgresql+asyncpg://cinema_db_user:cinema_db_password@localhost:5432/cinema_db_global',
    "krakow": 'postgresql+asyncpg://cinema_db_user:cinema_db_password@localhost:5433/cinema_db_krakow',
    "warsaw": 'postgresql+asyncpg://cinema_db_user:cinema_db_password@localhost:5434/cinema_db_warsaw'
}

async def validate_database_url(engine_url: str, db_name: str):
    """Validate the database URL by attempting to connect."""
    print(f"Validating database URL for {db_name}: {engine_url}")
    engine = create_async_engine(engine_url, echo=False)
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print(f"Connection to {db_name} database validated successfully.")
    except OperationalError as e:
        print(f"Failed to connect to {db_name} database. Check the URL: {engine_url}")
        print(f"Error details: {e}")
        raise
    finally:
        await engine.dispose()

async def delete_database(engine_url: str, db_name: str):
    """Delete all tables in the database with cascade."""
    print(f"Attempting to delete all tables in {db_name} database...")
    engine = create_async_engine(engine_url, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(lambda conn: conn.execute(text("DROP SCHEMA public CASCADE")))
        await conn.run_sync(lambda conn: conn.execute(text("CREATE SCHEMA public")))
        print(f"All tables in {db_name} database deleted successfully.")
    await engine.dispose()

async def main():
    for db_name, db_url in DATABASE_URLS.items():
        if not db_url:
            print(f"Database URL for {db_name} is not set. Skipping...")
            continue
        await validate_database_url(db_url, db_name)
        await delete_database(db_url, db_name)

if __name__ == "__main__":
    asyncio.run(main())
