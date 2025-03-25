from pydantic import BaseModel, Field
from datetime import datetime

class ShowBase(BaseModel):
    """
    Base model for a show, containing common fields.
    """
    movie_id: int = Field(..., ge=1, title="Movie ID", description="ID of the movie being shown.")
    hall_id: int = Field(..., ge=1,title="Hall ID", description="ID of the hall where the show is taking place.")
    start_time: datetime = Field(..., title="Start Time", description="Date and time when the show starts.")
    price: float = Field(..., title="Ticket Price", description="Price of a ticket for this show.")

class ShowModel(ShowBase):
    """
    Pydantic model representing a show with an ID.
    """
    id: int = Field(..., ge=1, title="Show ID", description="Unique identifier for the show in the database.")

    class Config:
        from_attributes = True
