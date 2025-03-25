from pydantic import BaseModel, Field
from datetime import datetime

class ReservationBase(BaseModel):
    """
    Base model for a reservation, containing common fields.
    """
    user_id: int = Field(..., ge=1,title="User ID", description="ID of the user making the reservation.")
    show_id: int = Field(..., ge=1,title="Show ID", description="ID of the show for which the reservation is made.")
    status: str = Field(..., ge=1, title="Reservation Status", description="Current status of the reservation (e.g., pending, confirmed, canceled).")
    created_at: datetime = Field(..., title="Created At", description="Timestamp when the reservation was created.")

class ReservationModel(ReservationBase):
    """
    Pydantic model representing a reservation with an ID.
    """
    id: int = Field(..., ge=1, title="Reservation ID", description="Unique identifier for the reservation in the database.")

    class Config:
        from_attributes = True