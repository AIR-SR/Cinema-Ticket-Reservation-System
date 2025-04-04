from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core import get_db_global
from models_local import Movie
from core import get_db_local


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
    return [{"tmdbID": movie.tmdbID, "title": movie.title} for movie in movies]


# @router.post("/add", response_description="Add a new movie", status_code=201)
# async def add_movie(movie: Movie, db: AsyncSession = Depends(get_db_global)):
#     """
#     Add a new movie to the database.
#     :param movie: Movie object to be added
#     :param db: Database session
#     :return: Added movie object
#     """
#     db.add(movie)
#     await db.commit()
#     await db.refresh(movie)
#     return movie

@router.get("/get/all", response_description="List of movies by city")
async def get_movies_by_city(region: str, db: AsyncSession = Depends(get_db_local)):
    """
    Get movies based on region.
    :param region: Region name ('global', 'krakow', 'warsaw')
    :param db: Database session
    :return: List of movies for selected region
    """
    # Wybór tabeli w zależności od regionu
    if region in ["krakow", "warsaw"]:
        query = select(Movie)
    else:
        raise HTTPException(status_code=400, detail="Invalid region")

    result = await db.execute(query)
    movies = result.scalars().all()

    if not movies:
        raise HTTPException(status_code=404, detail="No movies found for this region")

    return movies