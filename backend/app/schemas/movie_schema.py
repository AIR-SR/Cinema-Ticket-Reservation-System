from datetime import date
from typing import List

from pydantic import BaseModel, Field


class MovieAdd(BaseModel):
    """
    Base model for a movie, containing common fields shared across different representations of a movie.
    """

    tmdbID: int = Field(
        None,
        title="TMDB ID",
        description="The unique identifier for the movie on TMdb. This field must be unique.",
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """


class MovieBase(MovieAdd):
    title: str = Field(
        ...,
        title="Movie Title",
        description="The title of the movie. This is a required field.",
    )
    release_date: date = Field(
        ...,
        title="Release Date",
        description="The release date of the movie. This is a required field.",
    )
    poster_path: str = Field(
        None, title="Poster Path", description="The path to the movie's poster image."
    )
    runtime: int = Field(
        None, title="Runtime", description="The runtime of the movie in minutes."
    )
    genres: List[str] = Field(
        None, title="Genres", description="A list of genres associated with the movie."
    )
    description: str = Field(
        ...,
        title="Movie Description",
        description="A brief description of the movie. This is a required field.",
    )


class MovieModel(MovieBase):
    """
    Pydantic model representing a movie with additional fields, including a unique identifier.
    """

    id: int = Field(
        ...,
        ge=1,
        title="Movie ID",
        description="A unique identifier for the movie in the database. Must be a positive integer.",
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """


class MovieTitle(BaseModel):
    """
    Pydantic model representing a movie title.
    """

    id: int = Field(
        ...,
        ge=1,
        title="Movie ID",
        description="A unique identifier for the movie in the database. Must be a positive integer.",
    )
    title: str = Field(
        ...,
        title="Movie Title",
        description="The title of the movie. This is a required field.",
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """
