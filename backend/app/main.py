from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.events import EVENT_JOB_ERROR

from api import api_router
from core import (
    create_default_user,
    delete_unpaid_reservations,
    get_db_global,
    get_db_local,
    init_db_on_startup,
    logger,
    settings,
)


class DelayMiddleware:
    """Middleware to introduce a delay in API responses."""

    def __init__(self, app: FastAPI, delay: float):
        self.app = app
        self.delay = delay

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            await asyncio.sleep(self.delay)  # Introduce the delay
        await self.app(scope, receive, send)


task_lock = asyncio.Lock()
scheduler = AsyncIOScheduler()  # Single scheduler instance


async def check_reservations_paid():
    """Check if reservations have been paid and delete unpaid ones."""
    async with task_lock:
        try:
            for db_getter in [get_db_local("krakow"), get_db_local("warsaw")]:
                async for db in db_getter:
                    logger.info("Checking for unpaid reservations...")
                    await delete_unpaid_reservations(db)
                    break
        except Exception as e:
            logger.error(f"Error while checking reservations: {e}")


def job_error_listener(event):
    if event.exception:
        logger.error(f"Job failed: {event.exception}")


async def on_startup():
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

    # Schedule the job only if it doesn't exist
    if not scheduler.get_job("check_reservations_paid"):
        loop = asyncio.get_running_loop()
        scheduler.add_job(
            lambda: asyncio.run_coroutine_threadsafe(check_reservations_paid(), loop),
            "interval",
            minutes=1,
            id="check_reservations_paid",
            replace_existing=True,
        )
        scheduler.add_listener(job_error_listener, EVENT_JOB_ERROR)
        scheduler.start()


async def on_shutdown():
    logger.info("Shutting down the application...")
    scheduler.shutdown(wait=False)


app = FastAPI(on_startup=[on_startup], on_shutdown=[on_shutdown])

app.add_middleware(DelayMiddleware, delay=0)

origins = [
    settings.FRONTEND_URL,  # Existing frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=[
        "GET",
        "POST",
        "PATCH",
        "PUT",
        "DELETE",
    ],  # Restrict to necessary methods
    # Restrict to necessary headers
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(api_router)
