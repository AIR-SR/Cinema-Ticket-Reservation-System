from core import create_access_token, get_db_global, verify_password
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from models_global import UsersGlobal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

router = APIRouter(prefix="/login", tags=["Login"])


@router.post(
    "/",
    response_description="Access token for authenticated user",
    summary="Authenticate User",
    description="Authenticate a user using their credentials and return a JWT access token.",
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db_global),
):
    """
    Authenticate a user and return an access token.

    This endpoint validates the provided username and password.
    - **Input**: Username and password via `OAuth2PasswordRequestForm`.
    - **Validation**: Checks if the user exists and if the password is correct.
    - **Returns**: A JSON object containing a JWT access token and its type if authentication is successful.
    - **Raises**: HTTP 400 error if the credentials are invalid.
    """
    query = select(UsersGlobal).where(UsersGlobal.username == form_data.username)
    result = await db.execute(query)
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}
