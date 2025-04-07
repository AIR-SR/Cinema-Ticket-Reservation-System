from core import GlobalBase
from sqlalchemy import Column, Integer, String


class UsersGlobal(GlobalBase):
    """
    Represents a global user in the system.

    Attributes:
        id (int): The unique identifier for the user.
        username (str): The unique username of the user.
        first_name (str): The first name of the user.
        last_name (str): The last name of the user.
        email (str): The email address of the user.
        hashed_password (str): The hashed password of the user.
        role (str): The role of the user in the system.
    """
    __tablename__ = 'users_global'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    hashed_password = Column(String)
    role = Column(String)

    class Config:
        """
        Configuration for the SQLAlchemy model.
        """
        orm_mode = True
