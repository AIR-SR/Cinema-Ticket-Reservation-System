from core import GlobalBase
from sqlalchemy import Column, Integer, String, ForeignKey

class UserGlobal(GlobalBase):
    __tablename__ = 'user_global'
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    hashed_password = Column(String)