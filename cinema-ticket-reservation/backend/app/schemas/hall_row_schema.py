from pydantic import BaseModel, Field

class HallRowsBase(BaseModel):
    """
    Base model for hall rows, containing common fields.
    """
    hall_id: int = Field(..., ge=1, title="Hall ID", description="Identifier of the hall this row belongs to.")
    row_number: int = Field(..., ge=1, title="Row Number", description="The number of the row in the hall.")
    seat_count: int = Field(..., ge=1, title="Seat Count", description="The number of seats in this row.")


class HallRowsModel(HallRowsBase):
    """
    Pydantic model representing a hall row with an ID.
    """
    id: int = Field(..., ge=1, title="Row ID", description="Unique identifier for the hall row in the database.")

    class Config:
        from_attributes = True