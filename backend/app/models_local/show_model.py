from core import LocalBase
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship


class Show(LocalBase):
    """
    Represents a show in the cinema.

    Attributes:
        id (int): The unique identifier for the show.
        movie_id (int): The ID of the movie being shown.
        hall_id (int): The ID of the hall where the show is taking place.
        start_time (datetime): The start time of the show.
        price (float): The ticket price for the show.
        movie (Movie): The movie associated with this show.
        hall (Hall): The hall where the show is being held.
    """
    __tablename__ = 'shows'

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey('movies.id'), index=True)
    hall_id = Column(Integer, ForeignKey('halls.id'), index=True)
    start_time = Column(DateTime)
    price = Column(Float)

    movie = relationship("Movie", back_populates="shows")
    hall = relationship("Hall", back_populates="shows")
    # reservation = relationship("Reservation", back_populates="show")
