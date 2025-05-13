from pydantic import BaseModel, Field


class HallBase(BaseModel):
    """
    Base model for a hall, containing common fields shared across different representations of a hall.
    """

    name: str = Field(
        ...,
        title="Hall Name",
        description="The name of the hall. This is a descriptive label for the hall.",
    )


class HallModel(HallBase):
    """
    Pydantic model representing a hall with an additional unique identifier.
    """

    id: int = Field(
        ...,
        ge=1,
        title="Hall ID",
        description="A unique identifier for the hall in the database. Must be a positive integer.",
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """


class SeatHallModel(BaseModel):
    """
    Pydantic model representing a seat in a hall row.
    """

    id: int = Field(
        ...,
        ge=1,
        title="Seat ID",
        description="A unique identifier for the seat in the database. Must be a positive integer.",
    )
    seat_number: int = Field(
        ...,
        ge=1,
        title="Seat Number",
        description="The number of the seat within the row. Must be a positive integer.",
    )


class HallRowWithSeatsModel(BaseModel):
    """
    Pydantic model representing a hall row with its associated seats.
    """

    id: int = Field(
        ...,
        ge=1,
        title="Row ID",
        description="A unique identifier for the row in the database. Must be a positive integer.",
    )
    row_number: int = Field(
        ...,
        ge=1,
        title="Row Number",
        description="The number of the row within the hall. Must be a positive integer.",
    )
    hall_id: int = Field(
        ...,
        ge=1,
        title="Hall ID",
        description="The ID of the hall to which this row belongs. Must be a positive integer.",
    )
    seat_count: int = Field(
        ...,
        ge=0,
        title="Seat Count",
        description="The total number of seats in the row. Must be a non-negative integer.",
    )
    seats: list[SeatHallModel] = Field(
        ...,
        title="Seats",
        description="A list of seats in the row, represented as SeatModel objects.",
    )
