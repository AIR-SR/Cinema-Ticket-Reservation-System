from pydantic import BaseModel, Field


class HallRowsBase(BaseModel):
    """
    Base model for hall rows, containing common fields shared across different representations of a hall row.
    """
    hall_id: int = Field(
        ...,
        ge=1,
        title="Hall ID",
        description="The unique identifier of the hall this row belongs to. Must be a positive integer."
    )
    row_number: int = Field(
        ...,
        ge=1,
        title="Row Number",
        description="The sequential number of the row in the hall. Must be a positive integer."
    )
    seat_count: int = Field(
        ...,
        ge=1,
        title="Seat Count",
        description="The total number of seats available in this row. Must be a positive integer."
    )


class HallRowsModel(HallRowsBase):
    """
    Pydantic model representing a hall row with an additional unique identifier.
    """
    id: int = Field(
        ...,
        ge=1,
        title="Row ID",
        description="A unique identifier for the hall row in the database. Must be a positive integer."
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """
