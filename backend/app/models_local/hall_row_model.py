from core import LocalBase
from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship


class Hall_Row(LocalBase):
    __tablename__ = 'hall_rows'

    id = Column(Integer, primary_key=True, index=True)
    hall_id = Column(Integer, ForeignKey('halls.id'), index=True)
    row_number = Column(Integer, index=True)
    seat_count = Column(Integer, index=True)

    hall = relationship("Hall", back_populates="hall_rows")
    seat = relationship("Seat", back_populates="hall_row")


