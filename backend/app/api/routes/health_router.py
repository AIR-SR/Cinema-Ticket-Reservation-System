from fastapi import APIRouter, Depends
from core import admin_required, user_required, employee_required
from models_global import UsersGlobal

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/",
            response_description="API health check status",
            summary="Check API Health",
            description="Verify if the API is operational. Returns a status and a message indicating the API's health.")
async def health_check():
    """
    Perform a health check for the API.

    This endpoint verifies if the API is operational.
    - **Returns**: A JSON object with a status of 'ok' and a message confirming that the API is running.
    """
    return {'status': 'ok', 'message': 'API is running'}

@router.get("/admin",
            response_description="Admin API health check status",
            summary="Check Admin API Health",
            description="Verify if the API is operational for admin users. Requires admin authentication.")
async def admin_health_check(current_user: UsersGlobal = Depends(admin_required)):
    """
    Perform a health check for admin users.

    This endpoint verifies if the API is operational for admin users.
    - **Requires**: Admin authentication.
    - **Returns**: A JSON object with a status of 'ok' and a message confirming that the API is running for admin users.
    """
    return {'status': 'ok', 'message': 'API is running for admin users'}

@router.get("/user",
            response_description="User API health check status",
            summary="Check User API Health",
            description="Verify if the API is operational for regular users. Requires user authentication.")
async def user_health_check(current_user: UsersGlobal = Depends(user_required)):
    """
    Perform a health check for regular users.

    This endpoint verifies if the API is operational for regular users.
    - **Requires**: User authentication.
    - **Returns**: A JSON object with a status of 'ok' and a message confirming that the API is running for regular users.
    """
    return {'status': 'ok', 'message': 'API is running for regular users'}

@router.get("/employee",
            response_description="Employee API health check status",
            summary="Check Employee API Health",
            description="Verify if the API is operational for employees. Requires employee authentication.")
async def employee_health_check(current_user: UsersGlobal = Depends(employee_required)):
    """
    Perform a health check for employees.

    This endpoint verifies if the API is operational for employees.
    - **Requires**: Employee authentication.
    - **Returns**: A JSON object with a status of 'ok' and a message confirming that the API is running for employees.
    """
    return {'status': 'ok', 'message': 'API is running for employees'}
