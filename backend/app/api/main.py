from fastapi import APIRouter

from .routes import health_router, login_router

api_router = APIRouter()

api_router.include_router(health_router.router)
api_router.include_router(login_router.router)