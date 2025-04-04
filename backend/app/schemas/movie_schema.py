from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class MovieBase(BaseModel):
    """
    Base model for a movie, containing common fields.
    """
    tmdbID: int = Field(None, title="TMDB ID", description="Unique identifier for the movie on TMdb.")

    class Config:
        # Allow population of fields from attributes as well
        from_attributes = True

class MovieModel(MovieBase):
    """
    Pydantic model representing a movie with an ID.
    """
    id: int = Field(..., ge=1, title="Movie ID", description="Unique identifier for the movie in the database.")
    title: str = Field(..., title="Movie Title", description="The title of the movie.")
    description: str = Field(..., title="Movie Description", description="A brief description of the movie.")


    class Config:
        from_attributes = True