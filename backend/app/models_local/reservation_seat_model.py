from core import LocalBase
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship


class Reservation_Seat(LocalBase):
    __tablename__ = 'reservation_seats'

    id = Column(Integer, primary_key=True, index=True)
    seat_id = Column(Integer, ForeignKey('seats.id'), index=True)
    reservation_id = Column(Integer, ForeignKey('reservations.id'), index=True)

    reservation = relationship("Reservation", back_populates="reservation_seat")
    seat = relationship("Seat", back_populates="reservation_seat")