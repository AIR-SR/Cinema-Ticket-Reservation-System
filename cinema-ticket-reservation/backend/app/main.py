from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import models as models
from core import settings, engine

logger = logging.getLogger("uvicorn")
logger.setLevel(logging.INFO)
app = FastAPI()

origins = [settings.FRONTEND_URL]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Restrict to necessary methods
    allow_headers=["Authorization", "Content-Type"],  # Restrict to necessary headers
)

@app.get("/") 
async def main_route():     
  return {"message": "API is running!"}

