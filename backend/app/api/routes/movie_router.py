from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core import get_db_global, admin_required
from models_local import Movie
from models_global import UsersGlobal
from schemas import MovieModel, MovieBase
from core import get_db_local, settings
import requests


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


@router.post("/add", response_model = MovieModel, response_description="Add a new movie", summary="Add Movie", description="Adds a new movie to the database.")
async def add_movie(movie: MovieBase, region: str, db: AsyncSession = Depends(get_db_local), current_user: UsersGlobal = Depends(admin_required)):
    """
    Add a new movie to the database.
    :param movie: Movie object to be added
    :param db: Database session
    :return: Added movie object
    """
    resposne = requests.get(f"{settings.TMDB_API_URL}/movie/{movie.tmdbID}?api_key={settings.TMDB_API_KEY}&language=pl-PL")
    if resposne.status_code != 200:
        raise HTTPException(status_code=resposne.status_code, detail="Error fetching data from TMDB API")
    new_movie = Movie(
        title=resposne.json().get("title"),
        description=resposne.json().get("overview"),
        tmdbID=movie.tmdbID,
    )
    db.add(new_movie)
    await db.commit()
    await db.refresh(new_movie)
    return new_movie

@router.get("/get/{movie_id}", response_model=MovieModel, response_description="Get movie by ID", summary="Get Movie by ID", description="Returns a movie by its ID.")
async def get_movie_by_id(movie_id: int, region: str, db: AsyncSession = Depends(get_db_local)):
    """
    Get movie by ID.
    :param id: Movie ID
    :param db: Database session
    :return: Movie object
    """
    query = select(Movie).where(Movie.id == movie_id)
    result = await db.execute(query)
    movie = result.scalars().first()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    return movie

@router.get("/get", response_description="List of movies by city")
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