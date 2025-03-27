from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import models_local
import models_global
from core import settings, init_db_on_startup
from api import api_router

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

