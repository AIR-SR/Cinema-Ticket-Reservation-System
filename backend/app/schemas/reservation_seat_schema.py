from pydantic import BaseModel, Field


class ReservationSeatBase(BaseModel):
    """
    Base model for a reservation seat, containing common fields shared across different representations of a reservation seat.
    """
    seat_id: int = Field(
        ..., 
        ge=1, 
        title="Seat ID", 
        description="The unique identifier of the seat being reserved. Must be a positive integer."
    )
    reservation_id: int = Field(
        ..., 
        ge=1, 
        title="Reservation ID", 
        description="The unique identifier of the associated reservation. Must be a positive integer."
    )


class ReservationSeatModel(ReservationSeatBase):
    """
    Pydantic model representing a reservation seat with an additional unique identifier.
    """
    id: int = Field(
        ..., 
        ge=1, 
        title="Reservation Seat ID", 
        description="A unique identifier for the reservation seat in the database. Must be a positive integer."
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """
