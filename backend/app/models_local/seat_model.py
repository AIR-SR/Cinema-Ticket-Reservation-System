from core import LocalBase
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Seat(LocalBase):
    """
    Represents a seat in a cinema hall.

    Attributes:
        id (int): The unique identifier for the seat.
        row_id (int): The ID of the row this seat belongs to.
        seat_number (int): The number of the seat in the row.
        seat_type (str): The type of the seat (e.g., regular, VIP).
        hall_row (Hall_Row): The row this seat is associated with.
        reservation_seat (list): A list of reservations associated with this seat.
    """
    __tablename__ = 'seats'

    id = Column(Integer, primary_key=True, index=True)
    row_id = Column(Integer, ForeignKey('hall_rows.id'), index=True)
    seat_number = Column(Integer, index=True)
    seat_type = Column(String)

    hall_row = relationship("Hall_Row", back_populates="seat")
    reservation_seat = relationship("Reservation_Seat", back_populates="seat")
