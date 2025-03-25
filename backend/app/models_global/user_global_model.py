from app.core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey

class UserGlobal(Base):
    __tablename__ = 'user_global'
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String)
    hashed_password = Column(String)