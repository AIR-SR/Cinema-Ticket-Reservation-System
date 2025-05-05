from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import api_router
from core import (create_default_user, get_db_global, init_db_on_startup,
                  logger, settings)


async def app_lifespan(app: FastAPI):
    """Lifespan event handler for application startup and shutdown."""
    logger.info("Starting up the application...")
    await init_db_on_startup()
    logger.info(settings.FRONTEND_URL)
    # Create the default user
    try:
        async for db in get_db_global():  # Call the function to get the async iterable
            await create_default_user(db)
            logger.info("Default user created successfully.")
            break  # Exit after using the first database session
    except Exception as e:
        logger.error(f"Error creating default user: {e}")
        raise
    yield  # Yield control for the application to run
    logger.info("Shutting down the application...")

app = FastAPI(lifespan=app_lifespan)

origins = [
    settings.FRONTEND_URL,  # Existing frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PATCH", "PUT",
                   "DELETE"],  # Restrict to necessary methods
    # Restrict to necessary headers
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(api_router)
