from app.core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship

class Payment(Base):
    """
    Represents a category for items.
    """
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey('reservations.id'), index=True)
    amount = Column(Float, ForeignKey('shows.id'))
    payment_method = Column(String)
    status = Column(String)
    created_at = Column(DateTime)

    reservation = relationship("Reservation", back_populates="payment")