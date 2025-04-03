from core import LocalBase
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class Movie(LocalBase):
    __tablename__ = 'movies'

    id = Column(Integer, primary_key=True, index=True)
    tmdbID = Column(Integer, index=True)
    title = Column(String)
    description = Column(String)

    shows = relationship("Show", back_populates="movie")