from core import GlobalBase
from sqlalchemy import Column, Integer, String, ForeignKey


class AdminGlobal(GlobalBase):
    __tablename__ = 'admin_global'

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, index=True)
    username = Column(String)
    email = Column(String)
    hashed_password = Column(String)