from pydantic import BaseModel, Field

class SeatBase(BaseModel):
    """
    Base model for a seat, containing common fields.
    """
    row_id: int = Field(..., ge=1, title="Row ID", description="ID of the row to which this seat belongs.")
    seat_number: int = Field(..., ge=1, title="Seat Number", description="Number assigned to this seat within the row.")
    seat_type: str = Field(..., title="Seat Type", description="Type of seat (e.g., regular, VIP, wheelchair-accessible).")

class SeatModel(SeatBase):
    """
    Pydantic model representing a seat with an ID.
    """
    id: int = Field(..., ge=1, title="Seat ID", description="Unique identifier for the seat in the database.")

    class Config:
        from_attributes = True
