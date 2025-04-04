from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field


class UserGlobalBase(BaseModel):
    """
    Base model for a global user, containing common fields shared across different representations of a user.
    """
    username: str = Field(
        ..., 
        title="Username", 
        description="A unique username for the user. This is a required field."
    )
    first_name: str = Field(
        ..., 
        title="First Name", 
        description="The user's first name. This is a required field."
    )
    last_name: str = Field(
        ..., 
        title="Last Name", 
        description="The user's last name. This is a required field."
    )
    email: EmailStr = Field(
        ..., 
        title="Email", 
        description="The user's email address. This is a required field."
    )
    role: Literal["admin", "employee", "user"] = Field(
        ..., 
        title="Role", 
        description="The user's role in the system. Must be one of 'admin', 'employee', or 'user'."
    )
    hashed_password: str = Field(
        ..., 
        title="Hashed Password", 
        description="The securely stored hashed password for the user."
    )


class UserGlobalModel(BaseModel):
    """
    Pydantic model representing a global user with an additional unique identifier.
    """
    id: int = Field(
        ..., 
        ge=1, 
        title="User ID", 
        description="A unique identifier for the user in the database. Must be a positive integer."
    )
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
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """


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


class UserGlobalUpdate(BaseModel):
    """
    Pydantic model for updating a global user.
    """
    username: Optional[str] = Field(None, title="Username",
                                    description="Unique username for the user.")
    first_name: Optional[str] = Field(None, title="First Name",
                                      description="User's first name.")
    last_name: Optional[str] = Field(None, title="Last Name",
                                     description="User's last name.")
    email: Optional[EmailStr] = Field(None, title="Email",
                                      description="User's email address.")


class UserAdminGlobalCreate(BaseModel):
    """
    Pydantic model for creating a new admin global user.
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
    old_password: str = Field(
        ..., 
        title="Old Password", 
        description="The user's current password. This is a required field."
    )
    new_password: str = Field(
        ..., 
        title="New Password", 
        description="The user's new password. This is a required field."
    )
