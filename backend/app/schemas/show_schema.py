from datetime import datetime
from pydantic import BaseModel, Field


class ShowBase(BaseModel):
    """
    Base model for a show, containing common fields shared across different representations of a show.
    """
    movie_id: int = Field(
        ..., 
        ge=1, 
        title="Movie ID", 
        description="The unique identifier of the movie being shown. Must be a positive integer."
    )
    hall_id: int = Field(
        ..., 
        ge=1, 
        title="Hall ID", 
        description="The unique identifier of the hall where the show is taking place. Must be a positive integer."
    )
    start_time: datetime = Field(
        ..., 
        title="Start Time", 
        description="The date and time when the show starts. This is a required field."
    )
    price: float = Field(
        ..., 
        title="Ticket Price", 
        description="The price of a ticket for this show. Must be a positive value."
    )


class ShowModel(ShowBase):
    """
    Pydantic model representing a show with an additional unique identifier.
    """
    id: int = Field(
        ..., 
        ge=1, 
        title="Show ID", 
        description="A unique identifier for the show in the database. Must be a positive integer."
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """
