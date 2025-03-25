from app.core.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship


class Seat(Base):
    __tablename__ = 'seats'

    id = Column(Integer, primary_key=True, index=True)
    row_id = Column(Integer, ForeignKey('hall_rows.id'), index=True)
    seat_number = Column(Integer, index=True)
    seat_type = Column(String)

    hall_row = relationship("Hall_Rows", back_populates="seat")
    reservation_seat = relationship("Reservation_Seat", back_populates="seat")
