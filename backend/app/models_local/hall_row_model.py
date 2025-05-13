from core import LocalBase
from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship


class HallRow(LocalBase):
    """
    Represents a row in a cinema hall.

    Attributes:
        id (int): The unique identifier for the row.
        hall_id (int): The ID of the hall this row belongs to.
        row_number (int): The number of the row in the hall.
        seat_count (int): The number of seats in the row.
        hall (Hall): The hall this row is associated with.
        seat (list): A list of seats in this row.
    """

    __tablename__ = "hall_rows"

    id = Column(Integer, primary_key=True, index=True)
    hall_id = Column(Integer, ForeignKey("halls.id"), index=True)
    row_number = Column(Integer, index=True)
    seat_count = Column(Integer, index=True)

    hall = relationship("Hall", back_populates="hall_rows")
    seats = relationship("Seat", back_populates="hall_row")
