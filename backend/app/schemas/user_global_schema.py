from pydantic import BaseModel, Field, EmailStr

class UserGlobalBase(BaseModel):
    """
    Base model for a global user, containing common fields.
    """
    first_name: str = Field(..., title="First Name", description="User's first name.")
    last_name: str = Field(..., title="Last Name", description="User's last name.")
    email: EmailStr = Field(..., title="Email", description="User's email address.")
    hashed_password: str = Field(..., title="Hashed Password", description="Securely stored hashed password.")

class UserGlobalModel(UserGlobalBase):
    """
    Pydantic model representing a global user with an ID.
    """
    id: int = Field(..., ge=1, title="User ID", description="Unique identifier for the user in the database.")

    class Config:
        from_attributes = True
