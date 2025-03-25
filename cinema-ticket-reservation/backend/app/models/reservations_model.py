from app.core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship


class Reservation(Base):
    """
    Represents a category for items.
    """
    __tablename__ = 'reservations'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), index=True)
    show_id = Column(Integer, ForeignKey('shows.id'), index=True)
    status = Column(String)
    created_at = Column(DateTime)

    user = relationship("User", back_populates="reservation")
    show = relationship("Show", back_populates="reservation")
    payment = relationship("Payment", back_populates="reservation")
    reservation_seat = relationship("Reservation_Seat", back_populates="reservation")
