from datetime import datetime

from pydantic import BaseModel, Field


class ReservationBase(BaseModel):
    """
    Base model for a reservation, containing common fields shared across different representations of a reservation.
    """
    show_id: int = Field(
        ...,
        ge=1,
        title="Show ID",
        description="The unique identifier of the show for which the reservation is made. Must be a positive integer."
    )
    status: str = Field(
        ...,
        title="Reservation Status",
        description="The current status of the reservation (e.g., pending, confirmed, canceled). This is a required field."
    )
    created_at: datetime = Field(
        ...,
        title="Created At",
        description="The timestamp indicating when the reservation was created. This is a required field."
    )


class ReservationModel(ReservationBase):
    """
    Pydantic model representing a reservation with an additional unique identifier.
    """
    id: int = Field(
        ...,
        ge=1,
        title="Reservation ID",
        description="A unique identifier for the reservation in the database. Must be a positive integer."
    )
    user_id: int = Field(
        ...,
        ge=1,
        title="User ID",
        description="The unique identifier of the user making the reservation. Must be a positive integer."
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """
