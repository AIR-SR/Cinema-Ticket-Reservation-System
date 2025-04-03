from core import LocalBase
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship


class Show(LocalBase):
    __tablename__ = 'shows'

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey('movies.id'), index=True)
    hall_id = Column(Integer, ForeignKey('halls.id'), index=True)
    start_time = Column(DateTime)
    price = Column(Float)

    movie = relationship("Movie", back_populates="shows")
    hall = relationship("Hall", back_populates="shows")
    # reservation = relationship("Reservation", back_populates="show")
