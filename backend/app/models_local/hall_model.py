from core import LocalBase
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Hall(LocalBase):
    __tablename__ = 'halls'

    id = Column(Integer, primary_key=True, index=True)
    shows_id = Column(Integer, ForeignKey('shows.id'), index=True)
    name = Column(String)

    show = relationship("Show", back_populates="hall")
    hall_row = relationship("Hall_Rows", back_populates="hall")