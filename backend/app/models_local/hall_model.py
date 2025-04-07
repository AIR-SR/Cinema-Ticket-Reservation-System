from core import LocalBase
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class Hall(LocalBase):
    """
    Represents a cinema hall.

    Attributes:
        id (int): The unique identifier for the hall.
        name (str): The name of the hall.
        shows (list): A list of shows associated with the hall.
        hall_rows (list): A list of rows in the hall.
    """
    __tablename__ = 'halls'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

    shows = relationship("Show", back_populates="hall")
    hall_rows = relationship("Hall_Row", back_populates="hall")
