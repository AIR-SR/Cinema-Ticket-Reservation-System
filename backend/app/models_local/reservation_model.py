from core import LocalBase
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Reservation(LocalBase):
    """
    Represents a reservation in the system.

    Attributes:
        id (int): The unique identifier for the reservation.
        user_id (int): The ID of the user who made the reservation.
        show_id (int): The ID of the associated show.
        status (str): The status of the reservation (e.g., confirmed, canceled).
        created_at (datetime): The timestamp when the reservation was created.
        payment (Payment): The payment associated with this reservation.
        reservation_seat (list): A list of seats reserved in this reservation.
    """
    __tablename__ = 'reservations'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    show_id = Column(Integer, ForeignKey('shows.id'), index=True)
    status = Column(String)
    created_at = Column(DateTime)

    payment = relationship("Payment", back_populates="reservation")
    reservation_seat = relationship("Reservation_Seat", back_populates="reservation")
