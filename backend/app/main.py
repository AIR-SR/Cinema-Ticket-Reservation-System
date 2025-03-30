from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import models_local
import models_global
from core import settings, init_db_on_startup
from api import api_router
from core import get_db, create_default_user

logger = logging.getLogger("uvicorn")
logger.setLevel(logging.INFO)
app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await init_db_on_startup()

origins = [settings.FRONTEND_URL]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Restrict to necessary methods
    allow_headers=["Authorization", "Content-Type"],  # Restrict to necessary headers
)

app.include_router(api_router)

@app.on_event("startup")
async def on_startup():
    """Startup event to initialize the database and create default user."""
    logger.info("Starting up the application...")

    # Create the default user
    try:
        async for db in get_db("global"):  # Pass a string instead of a list
            await create_default_user(db)
            logger.info("Default user created successfully.")
            break  # Exit after using the first database session
    except Exception as e:
        logger.error(f"Error creating default user: {e}")
        raise