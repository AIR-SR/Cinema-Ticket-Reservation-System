from datetime import datetime, timedelta

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from models_global import UsersGlobal
from passlib.context import CryptContext
from schemas import UserGlobalModel
from sqlalchemy.orm import Session
from sqlalchemy.future import select  # Import select for async queries
from sqlalchemy.ext.asyncio import AsyncSession  # Import AsyncSession

from .config import settings
from .database import get_db_global

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

ROLE_ADMIN = "admin"
ROLE_USER = "user"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login/")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db_global)) -> UserGlobalModel:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = db.query(UsersGlobal).filter(UsersGlobal.username == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Convert SQLAlchemy User object to Pydantic UserModel
    return UserGlobalModel.model_validate(user)

async def admin_required(current_user: UsersGlobal = Depends(get_current_user)):
    if current_user.role != ROLE_ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to perform this action")
    return current_user

async def create_default_user(db: AsyncSession):
    """
    Creates a default admin user if no users exist in the database.
    """
    # Check if any user exists
    result = await db.execute(select(UsersGlobal))  # Use select with AsyncSession
    user_exists = result.scalars().first()  # Extract the first result
    if not user_exists:
        # Create a default admin user
        admin_user = UsersGlobal(
            username="admin",
            first_name="Admin",
            last_name="User",
            email="admin@admin.com",
            hashed_password=hash_password("admin"),  # Replace with a secure password
            role="admin"  # Assuming the User model has a 'role' field
        )
        db.add(admin_user)
        await db.commit()  # Use await for async commit
        await db.refresh(admin_user)
        print(f"Default admin user created: {admin_user.username}")
        return admin_user
    else:
        print("Default admin user already exists.")
        return None

def get_admin_emails(db: Session):
    """
    Fetches all admin emails from the database.
    """
    return [user.email for user in db.query(UsersGlobal).filter(UsersGlobal.role == "admin").all()]