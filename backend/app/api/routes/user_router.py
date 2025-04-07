from typing import List

from core import (
    admin_required, get_current_user, get_db_global, hash_password,
    verify_password, settings, logger
)
from fastapi import APIRouter, Depends, HTTPException
from models_global import UsersGlobal
from pydantic import ValidationError
from schemas import (
    PasswordChangeRequest, UserAdminGlobalCreate, UserGlobalCreate,
    UserGlobalModel, UserGlobalUpdate
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

router = APIRouter(prefix="/users", tags=["Users"])

ROLE_ADMIN = settings.ROLE_ADMIN
ROLE_USER = settings.ROLE_USER


@router.post("/register",
    response_model=UserGlobalModel,
    response_description="Details of the newly registered user",
    summary="Register User",
    description="Register a new user by providing username, password, and personal details."
)
async def create_user(user_data: UserGlobalCreate, db: AsyncSession = Depends(get_db_global)):
    """
    Register a new user.

    - **Input**: User data including username, password, and personal details.
    - **Validation**: Checks for duplicate usernames and hashes the password.
    - **Returns**: The newly created user object.
    - **Raises**: HTTP 400 error if the username already exists or HTTP 422 error for validation issues.
    """
    try:
        # Validate input data using Pydantic
        validated_data = UserGlobalCreate(**user_data.dict())

        # Check if user already exists
        existing_user = await db.execute(select(UsersGlobal).filter(UsersGlobal.username == validated_data.username))
        existing_user = existing_user.scalar_one_or_none()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        # Hash the password
        hashed_password = hash_password(validated_data.password)

        # Create new user
        new_user = UsersGlobal(
            username=validated_data.username,
            first_name=validated_data.first_name,
            last_name=validated_data.last_name,
            email=validated_data.email,
            hashed_password=hashed_password,
            role="user"
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        # admin_emails = get_admin_emails(db)
        # for email in admin_emails:
        #     send_email(email, "New User Registration", f"User {new_user.username} has registered.")

        return UserGlobalModel.model_validate(new_user).model_dump()

    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
    
@router.post("/register-admin",
    response_model=UserGlobalModel,
    response_description="Details of the newly registered admin user",
    summary="Register Admin User",
    description="Register a new admin user by providing username, password, and personal details."
)
async def create_admin_user(
    user_data: UserAdminGlobalCreate,
    db: AsyncSession = Depends(get_db_global),
    current_user: UsersGlobal = Depends(admin_required)
):
    """
    Register a new admin user.

    - **Input**: Admin user data including username, password, and personal details.
    - **Validation**: Checks for duplicate usernames and hashes the password.
    - **Returns**: The newly created admin user object.
    - **Raises**: HTTP 400 error if the username already exists or HTTP 422 error for validation issues.
    """
    try:
        # Validate input data using Pydantic
        validated_data = UserAdminGlobalCreate(**user_data.dict())
        # validated_data.role = ROLE_ADMIN  # Explicitly set role to admin

        # Check if user already exists
        existing_user = await db.execute(select(UsersGlobal).filter(UsersGlobal.username == validated_data.username))
        existing_user = existing_user.scalar_one_or_none()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        # Hash the password
        hashed_password = hash_password(validated_data.password)

        # Create new admin user
        new_user = UsersGlobal(
            username=validated_data.username,
            first_name=validated_data.first_name,
            last_name=validated_data.last_name,
            email=validated_data.email,
            hashed_password=hashed_password,
            role=validated_data.role,  # Set role to admin
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return UserGlobalModel.model_validate(new_user).model_dump()

    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())


@router.get("/get",
    response_model=List[UserGlobalModel],
    response_description="List of all users",
    summary="Fetch All Users",
    description="Retrieve a list of all users in the system. Accessible only by admin users."
)
async def get_users(
    db: AsyncSession = Depends(get_db_global),
    current_user: UsersGlobal = Depends(admin_required)
):
    """
    Retrieve all users.

    - **Access**: Only accessible by admin users.
    - **Returns**: A list of all users in the system.
    """
    result = await db.execute(select(UsersGlobal))
    return result.scalars().all()

@router.get("/get/{user_id}",
    response_model=UserGlobalModel,
    response_description="Details of the requested user",
    summary="Fetch User by ID",
    description="Retrieve details of a specific user by their ID. Accessible only by admin users."
)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db_global),
    current_user: UsersGlobal = Depends(admin_required)
):
    """
    Retrieve a specific user by their ID.

    - **Input**: User ID.
    - **Access**: Only accessible by admin users.
    - **Returns**: The user object for the requested user.
    - **Raises**: HTTP 404 error if the user is not found.
    """
    user = await db.execute(select(UsersGlobal).filter(UsersGlobal.id == user_id))
    user = user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/details",
    response_model=UserGlobalModel,
    response_description="Details of the currently authenticated user",
    summary="Fetch Current User Details",
    description="Retrieve details of the currently authenticated user."
)
async def get_me(current_user: UserGlobalModel = Depends(get_current_user)):
    """
    Retrieve details of the currently authenticated user.

    - **Returns**: The user object for the current user.
    """
    return current_user

@router.patch("/update/me",
    response_model=UserGlobalModel,
    response_description="Updated details of the current user",
    summary="Update Current User",
    description="Update the details of the currently authenticated user."
)
async def update_user(
    user_data: UserGlobalUpdate,
    db: AsyncSession = Depends(get_db_global),
    current_user: UsersGlobal = Depends(get_current_user)
):
    """
    Update details of the currently authenticated user.

    - **Input**: Partial user data for updates.
    - **Returns**: The updated user object.
    - **Raises**: HTTP 404 error if the user is not found or HTTP 422 error for validation issues.
    """
    logger.info(f"Current user: {current_user}")
    user_to_update = await db.execute(select(UsersGlobal).filter(UsersGlobal.id == current_user.id))
    user_to_update = user_to_update.scalar_one_or_none()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        validated_data = user_data.model_dump(exclude_unset=True)  # Pydantic handles validation
        for key, value in validated_data.items():
            setattr(user_to_update, key, value)
        await db.commit()
        await db.refresh(user_to_update)
        return UserGlobalModel.model_validate(user_to_update).model_dump()
    except ValidationError as e:
        # Log validation errors for debugging
        print(f"Validation Error: {e.errors()}")
        raise HTTPException(status_code=422, detail=e.errors())

@router.patch("/change-password",
    response_description="Password change confirmation",
    summary="Change Password",
    description="Change the password of the currently authenticated user by providing the old and new passwords."
)
async def change_password(
    password_data: PasswordChangeRequest,
    db: AsyncSession = Depends(get_db_global),
    current_user: UsersGlobal = Depends(get_current_user)
):
    """
    Change the password of the currently authenticated user.

    - **Input**: Old and new passwords.
    - **Validation**: Verifies the current password before updating.
    - **Returns**: A success message upon successful password change.
    - **Raises**: HTTP 400 error if the old password is incorrect or HTTP 404 error if the user is not found.
    """
    user_to_update = await db.execute(select(UsersGlobal).filter(UsersGlobal.id == current_user.id))
    user_to_update = user_to_update.scalar_one_or_none()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
    if verify_password(password_data.old_password, user_to_update.hashed_password):
        new_hashed_password = hash_password(password_data.new_password)
        user_to_update.hashed_password = new_hashed_password
        await db.commit()
        await db.refresh(user_to_update)
        return {"status": "ok", "message": "Password updated successfully"}
    else:
        raise HTTPException(status_code=400, detail="Incorrect old password")

@router.delete("/delete/{user_id}",
    response_description="Confirmation of user deletion",
    summary="Delete User",
    description="Delete a user by their ID. Accessible only by admin users."
)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db_global),
    current_user: UsersGlobal = Depends(admin_required)
):
    """
    Delete a user by their ID.

    - **Input**: User ID.
    - **Access**: Only accessible by admin users.
    - **Returns**: A success message upon successful deletion.
    - **Raises**: HTTP 404 error if the user is not found.
    """
    user = await db.execute(select(UsersGlobal).filter(UsersGlobal.id == user_id))
    user = user.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()
    return {"status": "ok", "message": f"User {user_id} deleted"}