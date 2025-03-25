from app.core.database import Base
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

class Hall_Rows(Base):
    __tablename__ = 'hall_rows'

    id = Column(Integer, primary_key=True, index=True)
    hall_id = Column(Integer, ForeignKey('halls.id'), index=True)
    row_number = Column(Integer, index=True)
    seat_count = Column(Integer, index=True)

    hall = relationship("Hall", back_populates="hall_row")
    seat = relationship("Seat", back_populates="hall_row")


