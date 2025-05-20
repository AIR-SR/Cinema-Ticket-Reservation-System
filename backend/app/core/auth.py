from datetime import datetime, timedelta

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from models_global import UsersGlobal
from passlib.context import CryptContext
from schemas import UserGlobalModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import Session

from .config import settings, logger
from .database import get_db_global

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

ROLE_ADMIN = settings.ROLE_ADMIN
ROLE_USER = settings.ROLE_USER
ROLE_EMPLOYEE = settings.ROLE_EMPLOYEE
PASSWORD = settings.ADMIN_PASSWORD

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login/")


def hash_password(password: str):
    """
    Hashes a plain text password using bcrypt.

    Args:
        password (str): The plain text password to hash.

    Returns:
        str: The hashed password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    """
    Verifies a plain text password against a hashed password.

    Args:
        plain_password (str): The plain text password.
        hashed_password (str): The hashed password.

    Returns:
        bool: True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Creates a JWT access token.

    Args:
        data (dict): The data to encode in the token.
        expires_delta (timedelta, optional): The token's expiration time. Defaults to ACCESS_TOKEN_EXPIRE_MINUTES.

    Returns:
        str: The encoded JWT token.
    """
    to_encode = data.copy()
    expire = datetime.now() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    """
    Decodes a JWT access token.

    Args:
        token (str): The JWT token to decode.

    Returns:
        dict: The decoded payload.

    Raises:
        HTTPException: If the token is invalid or expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db_global)
) -> UserGlobalModel:
    """
    Retrieves the current user based on the provided JWT token.

    Args:
        token (str): The JWT token.
        db (AsyncSession): The database session.

    Returns:
        UserGlobalModel: The current user as a Pydantic model.

    Raises:
        HTTPException: If the token is invalid or the user is not found.
    """
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Use select with AsyncSession
    user = await db.execute(
        select(UsersGlobal).where(UsersGlobal.username == payload.get("sub"))
    )
    user = user.scalars().first()  # Extract the first result
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Convert SQLAlchemy User object to Pydantic UserModel
    return UserGlobalModel.model_validate(user)


async def admin_required(current_user: UsersGlobal = Depends(get_current_user)):
    """
    Ensures the current user has admin privileges.

    Args:
        current_user (UsersGlobal): The current user.

    Returns:
        UsersGlobal: The current user if they are an admin.

    Raises:
        HTTPException: If the user is not an admin.
    """
    if current_user.role != ROLE_ADMIN:
        raise HTTPException(
            status_code=403, detail="Not authorized to perform this action"
        )
    return current_user


async def user_required(current_user: UsersGlobal = Depends(get_current_user)):
    """
    Ensures the current user has user privileges.

    Args:
        current_user (UsersGlobal): The current user.

    Returns:
        UsersGlobal: The current user if they are a regular user.

    Raises:
        HTTPException: If the user is not a regular user.
    """
    if current_user.role not in [ROLE_USER, ROLE_ADMIN, ROLE_EMPLOYEE]:
        raise HTTPException(
            status_code=403, detail="Not authorized to perform this action"
        )
    return current_user


async def employee_required(current_user: UsersGlobal = Depends(get_current_user)):
    """
    Ensures the current user has employee privileges.

    Args:
        current_user (UsersGlobal): The current user.

    Returns:
        UsersGlobal: The current user if they are an employee.

    Raises:
        HTTPException: If the user is not an employee.
    """
    if current_user.role not in [ROLE_ADMIN, ROLE_EMPLOYEE]:
        raise HTTPException(
            status_code=403, detail="Not authorized to perform this action"
        )
    return current_user


async def create_default_user(db: AsyncSession):
    """
    Creates a default admin user if no users exist in the database.

    Args:
        db (AsyncSession): The database session.

    Returns:
        UsersGlobal or None: The created admin user or None if a user already exists.
    """
    result = await db.execute(select(UsersGlobal))
    user_exists = result.scalars().first()
    if not user_exists:
        admin_user = UsersGlobal(
            username="admin",
            first_name="Admin",
            last_name="User",
            email="admin@admin.com",
            hashed_password=hash_password(PASSWORD),
            role="admin",
        )
        db.add(admin_user)
        await db.commit()
        await db.refresh(admin_user)
        print(f"Default admin user created: {admin_user.username}")
        return admin_user
    else:
        print("Default admin user already exists.")
        return None


async def get_admin_emails(db: AsyncSession):
    """
    Fetches all admin emails from the database using AsyncSession.

    Args:
        db (AsyncSession): The database session.

    Returns:
        list[str]: A list of admin email addresses.
    """
    result = await db.execute(
        select(UsersGlobal).where(UsersGlobal.role == "admin")
    )  # Use select with AsyncSession
    admins = result.scalars().all()
    return [admin.email for admin in admins]
