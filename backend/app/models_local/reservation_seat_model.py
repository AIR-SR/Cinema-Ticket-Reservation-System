from core import LocalBase
from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship


class Reservation_Seat(LocalBase):
    """
    Represents a reserved seat in the system.

    Attributes:
        id (int): The unique identifier for the reserved seat.
        seat_id (int): The ID of the seat being reserved.
        reservation_id (int): The ID of the associated reservation.
        reservation (Reservation): The reservation associated with this seat.
        seat (Seat): The seat associated with this reservation.
    """

    __tablename__ = "reservation_seats"

    id = Column(Integer, primary_key=True, index=True)
    seat_id = Column(Integer, ForeignKey("seats.id"), index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), index=True)

    reservation = relationship("Reservation", back_populates="reservation_seat")
    seat = relationship("Seat", back_populates="reservation_seat")
