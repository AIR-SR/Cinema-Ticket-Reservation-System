from fastapi import APIRouter

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
