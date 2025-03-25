from core import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship


class Reservation(Base):
    __tablename__ = 'reservations'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('user_global.id'), index=True)
    show_id = Column(Integer, ForeignKey('shows.id'), index=True)
    status = Column(String)
    created_at = Column(DateTime)

    user_global = relationship("UserGlobal", primaryjoin="Reservation.user_id == foreign(UserGlobal.id)", viewonly=True)
    show = relationship("Show", back_populates="reservation")
    payment = relationship("Payment", back_populates="reservation")
    reservation_seat = relationship("Reservation_Seat", back_populates="reservation")
