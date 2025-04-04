from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import api_router
from core import (create_default_user, get_db_global, init_db_on_startup,
                  settings, logger, save_movies_to_db, get_now_playing_movies, get_db_local)
import models_global
import models_local

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await init_db_on_startup()

origins = [
    settings.FRONTEND_URL,  # Existing frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],  # Restrict to necessary methods
    allow_headers=["Authorization", "Content-Type"],  # Restrict to necessary headers
)

app.include_router(api_router)

@app.on_event("startup")
async def on_startup():
    """Startup event to initialize the database and create default user."""
    logger.info("Starting up the application...")
    logger.info(settings.FRONTEND_URL)
    # Create the default user
    try:
        async for db in get_db_global():  # Call the function to get the async iterable
            await create_default_user(db)
            logger.info("Default user created successfully.")
            break  # Exit after using the first database session

        # async for db in get_db_local("krakow"):
        #     movies = await get_now_playing_movies()

        #     if movies:
        #         await save_movies_to_db(movies, db)
        #         logger.info("10 filmów zostało zapisanych do bazy danych.")
        #     else:
        #         logger.warning("Brak filmów do zapisania.")
        #     break

        # async for db in get_db_local("warsaw"):
        #     movies = await get_now_playing_movies()

        #     if movies:
        #         await save_movies_to_db(movies, db)
        #         logger.info("10 filmów zostało zapisanych do bazy danych.")
        #     else:
        #         logger.warning("Brak filmów do zapisania.")
        #     break

    except Exception as e:
        logger.error(f"Error creating default user: {e}")
        raise