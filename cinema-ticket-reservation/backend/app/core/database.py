from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings

DATABASE_URL = settings.DATABASE_URL

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependency to get the DB session.

    This function provides a SQLAlchemy session to interact with the database.
    It should be used as a dependency in FastAPI routes to ensure that the session
    is properly managed and closed after the request is completed.

    Yields:
        db (Session): A SQLAlchemy session object.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
