from core import create_access_token, get_db, verify_password
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from models_global import UsersGlobal
from sqlalchemy.orm import Session
from sqlalchemy.future import select

router = APIRouter(prefix="/login", tags=["Login"])


@router.post("/",
             response_description="Login response with access token",
             summary="User login",
             description="Authenticates a user and returns an access token.")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticate a user and return an access token.
    - Validates the username and password.
    - Returns a JWT access token if authentication is successful.
    """
    query = select(UsersGlobal).where(UsersGlobal.username == form_data.username)
    result = await db.execute(query)
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}