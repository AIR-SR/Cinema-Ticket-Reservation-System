from core import LocalBase
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Hall(LocalBase):
    __tablename__ = 'halls'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

    shows = relationship("Show", back_populates="hall")
    hall_rows = relationship("Hall_Row", back_populates="hall")