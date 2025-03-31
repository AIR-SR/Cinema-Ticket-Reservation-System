from fastapi import APIRouter, Depends
from core import admin_required, user_required, employee_required
from models_global import UsersGlobal

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/",
            response_description="Health check status",
            summary="Health Check Endpoint",
            description="Endpoint to check if the API is running properly. Returns a status and message.")
async def health_check():
    """
    This endpoint checks the health of the API.
    - Returns a status of 'ok' and a message confirming that the API is running.
    """
    return {'status': 'ok', 'message': 'API is running'}

@router.get("/admin",
            response_description="Admin health check status",
            summary="Admin Health Check Endpoint",
            description="Endpoint to check if the API is running properly for admin users.")
async def admin_health_check(current_user: UsersGlobal = Depends(admin_required)):
    """
    This endpoint checks the health of the API for admin users.
    - Returns a status of 'ok' and a message confirming that the API is running for admin users.
    """
    return {'status': 'ok', 'message': 'API is running for admin users'}

@router.get("/user",
            response_description="User health check status",
            summary="User Health Check Endpoint",
            description="Endpoint to check if the API is running properly for regular users.")
async def user_health_check(current_user: UsersGlobal = Depends(user_required)):
    """
    This endpoint checks the health of the API for regular users.
    - Returns a status of 'ok' and a message confirming that the API is running for regular users.
    """
    return {'status': 'ok', 'message': 'API is running for regular users'}

@router.get("/employee",
            response_description="Employee health check status",
            summary="Employee Health Check Endpoint",
            description="Endpoint to check if the API is running properly for employees.")
async def employee_health_check(current_user: UsersGlobal = Depends(employee_required)):
    """
    This endpoint checks the health of the API for employees.
    - Returns a status of 'ok' and a message confirming that the API is running for employees.
    """
    return {'status': 'ok', 'message': 'API is running for employees'}
