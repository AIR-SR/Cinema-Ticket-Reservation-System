from pydantic import BaseModel, Field

class HallBase(BaseModel):
    """
    Base model for a hall, containing common fields.
    """
    shows_id: int = Field(...,ge=1 ,title="Show ID", description="Identifier of the show associated with this hall.")
    name: str = Field(..., title="Hall Name", description="The name of the hall.")


class HallModel(HallBase):
    """
    Pydantic model representing a hall with an ID.
    """
    id: int = Field(...,ge=1, title="Hall ID", description="Unique identifier for the hall in the database.")

    class Config:
        from_attributes = True