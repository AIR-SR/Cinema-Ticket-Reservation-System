from core import LocalBase
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Payment(LocalBase):
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey('reservations.id'), index=True)
    # amount = Column(Float, ForeignKey('shows.id'))
    amount = Column(Float)
    payment_method = Column(String)
    status = Column(String)
    created_at = Column(DateTime)

    reservation = relationship("Reservation", back_populates="payment")