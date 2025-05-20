from fastapi import APIRouter

from .routes import (
    hall_router,
    health_router,
    login_router,
    movie_router,
    user_router,
    hall_rows_router,
    seat_router,
    show_router,
    reservation_router,
    payments_router,
)

api_router = APIRouter()

api_router.include_router(health_router.router)
api_router.include_router(login_router.router)
api_router.include_router(user_router.router)

api_router.include_router(movie_router.router)
api_router.include_router(hall_router.router)
api_router.include_router(hall_rows_router.router)
api_router.include_router(seat_router.router)

api_router.include_router(show_router.router)
api_router.include_router(reservation_router.router)
api_router.include_router(payments_router.router)
