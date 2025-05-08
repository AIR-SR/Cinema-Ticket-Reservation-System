from core import LocalBase
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Payment(LocalBase):
    """
    Represents a payment in the system.

    Attributes:
        id (int): The unique identifier for the payment.
        reservation_id (int): The ID of the associated reservation.
        amount (float): The amount paid.
        payment_method (str): The method of payment (e.g., credit card, cash).
        status (str): The status of the payment (e.g., completed, pending).
        created_at (datetime): The timestamp when the payment was created.
        reservation (Reservation): The reservation associated with this payment.
    """

    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), index=True)
    amount = Column(Float)
    payment_method = Column(String)
    status = Column(String)
    created_at = Column(DateTime)

    reservation = relationship("Reservation", back_populates="payment")
