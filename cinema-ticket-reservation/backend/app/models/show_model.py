from app.core.database import Base
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship


class Show(Base):
    """
    Represents a category for items.
    """
    __tablename__ = 'shows'

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey('movies.id'), index=True)
    hall_id = Column(Integer, ForeignKey('halls.id'), index=True)
    start_time = Column(DateTime)
    price = Column(Float)

    movie = relationship("Movie", back_populates="show")
    hall = relationship("Hall", back_populates="show")
    reservation = relationship("Reservation", back_populates="show")
