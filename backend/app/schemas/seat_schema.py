from pydantic import BaseModel, Field


class SeatBase(BaseModel):
    """
    Base model for a seat, containing common fields shared across different representations of a seat.
    """
    row_id: int = Field(
        ...,
        ge=1,
        title="Row ID",
        description="The unique identifier of the row to which this seat belongs. Must be a positive integer."
    )
    seat_number: int = Field(
        ...,
        ge=1,
        title="Seat Number",
        description="The number assigned to this seat within the row. Must be a positive integer."
    )
    seat_type: str = Field(
        ...,
        title="Seat Type",
        description="The type of seat (e.g., regular, VIP, wheelchair-accessible). This is a required field."
    )


class SeatModel(SeatBase):
    """
    Pydantic model representing a seat with an additional unique identifier.
    """
    id: int = Field(
        ...,
        ge=1,
        title="Seat ID",
        description="A unique identifier for the seat in the database. Must be a positive integer."
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """
