from pydantic import BaseModel, Field


class HallBase(BaseModel):
    """
    Base model for a hall, containing common fields shared across different representations of a hall.
    """
    shows_id: int = Field(
        ..., 
        ge=1, 
        title="Show ID", 
        description="The unique identifier of the show associated with this hall. Must be a positive integer."
    )
    name: str = Field(
        ..., 
        title="Hall Name", 
        description="The name of the hall. This is a descriptive label for the hall."
    )


class HallModel(HallBase):
    """
    Pydantic model representing a hall with an additional unique identifier.
    """
    id: int = Field(
        ..., 
        ge=1, 
        title="Hall ID", 
        description="A unique identifier for the hall in the database. Must be a positive integer."
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """