from app.core.database import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

class Movie(Base):
    """
    Represents a category for items.
    """
    __tablename__ = 'movies'

    id = Column(Integer, primary_key=True, index=True)
    imbdID = Column(String)
    title = Column(String)

    show = relationship("Show", back_populates="movies")