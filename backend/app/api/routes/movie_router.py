from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core import get_db_global
from models import Movie
from .db import get_db_local
router = APIRouter(prefix="/movies", tags=["Movies"])

# Endpoint do pobierania filmów
@router.get("/", response_description="List of Movies", summary="Get Movies", description="Returns a list of movies from the database.")
async def get_movies(db: AsyncSession = Depends(get_db_global)):
    """
    Retrieve a list of movies stored in the database.
    - Returns a list of movies with their IMDB ID and title.
    """
    query = select(Movie)
    result = await db.execute(query)  # Asynchronous query execution
    movies = result.scalars().all()

    if not movies:
        raise HTTPException(status_code=404, detail="No movies found")

    # Return list of movies in JSON format
    return [{"imbdID": movie.imbdID, "title": movie.title} for movie in movies]


router = APIRouter()

@router.get("/movies/{region}", response_description="List of movies by city")
async def get_movies_by_city(region: str, db: AsyncSession = Depends(get_db_local)):
    """
    Get movies based on region.
    :param region: Region name ('global', 'krakow', 'warsaw')
    :param db: Database session
    :return: List of movies for selected region
    """
    # Wybór tabeli w zależności od regionu
    if region == "krakow":
        query = select(Movie)
    elif region == "warsaw":
        query = select(Movie)
    else:
        raise HTTPException(status_code=400, detail="Invalid region")

    result = await db.execute(query)
    movies = result.scalars().all()

    if not movies:
        raise HTTPException(status_code=404, detail="No movies found for this region")

    return movies