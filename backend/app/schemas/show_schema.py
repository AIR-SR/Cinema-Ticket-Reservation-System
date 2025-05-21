from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ShowBase(BaseModel):
    """
    Base model for a show, containing common fields shared across different representations of a show.
    """

    movie_id: int = Field(
        ...,
        ge=1,
        title="Movie ID",
        description="The unique identifier of the movie being shown. Must be a positive integer.",
    )
    hall_id: int = Field(
        ...,
        ge=1,
        title="Hall ID",
        description="The unique identifier of the hall where the show is taking place. Must be a positive integer.",
    )
    start_time: datetime = Field(
        ...,
        title="Start Time",
        description="The date and time when the show starts. This is a required field.",
    )
    price: float = Field(
        ...,
        title="Ticket Price",
        description="The price of a ticket for this show. Must be a positive value.",
    )


class ShowModel(ShowBase):
    """
    Pydantic model representing a show with an additional unique identifier.
    """

    id: int = Field(
        ...,
        ge=1,
        title="Show ID",
        description="A unique identifier for the show in the database. Must be a positive integer.",
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """


class ShowDetailsShow(BaseModel):
    id: int = Field(..., ge=1)
    start_time: datetime
    price: float


class ShowDetailsMovie(BaseModel):
    id: int = Field(..., ge=1)
    title: str
    runtime: Optional[int] = None
    poster_path: Optional[str] = None


class ShowDetailsHall(BaseModel):
    id: int = Field(..., ge=1)
    name: str


class ShowDetailsReservation(BaseModel):
    show: ShowDetailsShow
    movie: ShowDetailsMovie
    hall: ShowDetailsHall
