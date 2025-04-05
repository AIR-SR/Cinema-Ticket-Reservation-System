from core import LocalBase
from sqlalchemy import Column, Integer, String, Date, JSON
from sqlalchemy.orm import relationship


class Movie(LocalBase):
    """
    Represents a movie in the system.

    Attributes:
        id (int): The unique identifier for the movie.
        tmdbID (int): The TMDB (The Movie Database) ID of the movie.
        title (str): The title of the movie.
        release_date (date): The release date of the movie.
        poster_path (str): The path to the movie's poster image.
        runtime (int): The runtime of the movie in minutes.
        genres (list): The genres associated with the movie.
        description (str): A brief description of the movie.
        shows (list): A list of shows associated with the movie.
    """
    __tablename__ = 'movies'

    id = Column(Integer, primary_key=True, index=True)
    tmdbID = Column(Integer, index=True, unique=True)
    title = Column(String)
    release_date = Column(Date)
    poster_path = Column(String)
    runtime = Column(Integer)
    genres = Column(JSON)
    description = Column(String)

    shows = relationship("Show", back_populates="movie")