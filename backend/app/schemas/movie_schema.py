from pydantic import BaseModel, Field


class MovieBase(BaseModel):
    """
    Base model for a movie, containing common fields.
    """
    imbdID: str | None = Field(None, title="IMDB ID", description="Unique identifier for the movie on IMDb.")
    title: str = Field(..., title="Movie Title", description="The title of the movie.")


class MovieModel(MovieBase):
    """
    Pydantic model representing a movie with an ID.
    """
    id: int = Field(..., ge=1, title="Movie ID", description="Unique identifier for the movie in the database.")

    class Config:
        from_attributes = True