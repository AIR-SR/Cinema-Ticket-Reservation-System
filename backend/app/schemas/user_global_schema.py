from pydantic import BaseModel, Field, EmailStr
from typing import Literal


class UserGlobalBase(BaseModel):
    """
    Base model for a global user, containing common fields.
    """
    username: str = Field(..., title="Username",
                          description="Unique username for the user.")
    first_name: str = Field(..., title="First Name",
                            description="User's first name.")
    last_name: str = Field(..., title="Last Name",
                           description="User's last name.")
    email: EmailStr = Field(..., title="Email",
                            description="User's email address.")
    role: Literal["admin", "employee", "user"] = Field(
        ..., title="Role", description="User's role in the system.")
    hashed_password: str = Field(..., title="Hashed Password",
                                 description="Securely stored hashed password.")


class UserGlobalModel(BaseModel):
    """
    Pydantic model representing a global user with an ID.
    """
    id: int = Field(..., ge=1, title="User ID",
                    description="Unique identifier for the user in the database.")
    username: str = Field(..., title="Username",
                          description="Unique username for the user.")
    first_name: str = Field(..., title="First Name",
                            description="User's first name.")
    last_name: str = Field(..., title="Last Name",
                           description="User's last name.")
    email: EmailStr = Field(..., title="Email",
                            description="User's email address.")
    role: Literal["admin", "employee", "user"] = Field(
        ..., title="Role", description="User's role in the system.")

    class Config:
        from_attributes = True


class UserGlobalCreate(BaseModel):
    """
    Pydantic model for creating a new global user.
    """
    username: str = Field(..., title="Username",
                          description="Unique username for the user.")
    first_name: str = Field(..., title="First Name",
                            description="User's first name.")
    last_name: str = Field(..., title="Last Name",
                           description="User's last name.")
    email: EmailStr = Field(..., title="Email",
                            description="User's email address.")
    password: str = Field(..., title="Password",
                          description="User's password.")
    role: Literal["admin", "employee", "user"] = Field(
        ..., title="Role", description="User's role in the system.")


class PasswordChangeRequest(BaseModel):
    """
    Pydantic model for changing a user's password.
    """
    old_password: str = Field(..., title="Old Password",
                              description="User's current password.")
    new_password: str = Field(..., title="New Password",
                              description="User's new password.")
