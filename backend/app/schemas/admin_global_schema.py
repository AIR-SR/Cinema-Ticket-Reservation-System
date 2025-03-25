from pydantic import BaseModel, Field, EmailStr

class AdminGlobalBase(BaseModel):
    """
    Base model for an admin user, containing common fields.
    """
    employee_id: int = Field(...,ge=1, title="Employee ID", description="Unique identifier for the employee.")
    username: str = Field(..., title="Username", description="Admin's username for login.")
    email: EmailStr = Field(..., title="Email", description="Admin's email address.")
    hashed_password: str = Field(..., title="Hashed Password", description="Securely stored hashed password.")

class AdminGlobalModel(AdminGlobalBase):
    """
    Pydantic model representing an admin user with an ID.
    """
    id: int = Field(..., ge=1, title="Admin ID", description="Unique identifier for the admin in the database.")

    class Config:
        from_attributes = True