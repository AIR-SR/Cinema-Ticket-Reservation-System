from core import GlobalBase
from sqlalchemy import Column, Integer, String


class UsersGlobal(GlobalBase):
    __tablename__ = 'users_global'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    hashed_password = Column(String)
    role = Column(String)

    class Config:
        orm_mode = True
