from pydantic import BaseModel, Field

class ReservationSeatBase(BaseModel):
    """
    Base model for a reservation seat, containing common fields.
    """
    reservation_id: int = Field(..., ge=1, title="Reservation ID", description="ID of the associated reservation.")

class ReservationSeatModel(ReservationSeatBase):
    """
    Pydantic model representing a reservation seat with an ID.
    """
    id: int = Field(..., ge=1, title="Reservation Seat ID", description="Unique identifier for the reservation seat in the database.")

    class Config:
        from_attributes = True
