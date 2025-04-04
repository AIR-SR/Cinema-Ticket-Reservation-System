from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from core import get_db_global, admin_required, get_db_local, settings
from models_local import Movie
from models_global import UsersGlobal
from schemas import MovieModel, MovieBase, MovieAdd
import requests
from pydantic import ValidationError

router = APIRouter(prefix="/movies", tags=["Movies"])


@router.get("/",
    response_description="Retrieve list of movies",
    summary="Fetch Movies",
    description="Fetch a list of movies stored in the database."
)
async def get_movies(db: AsyncSession = Depends(get_db_global)):
    """
    Retrieve a list of movies stored in the database.

    - **Returns**: A list of movies with their TMDB ID and title.
    - **Raises**: HTTP 404 error if no movies are found.
    """
    query = select(Movie)
    result = await db.execute(query)
    movies = result.scalars().all()

    if not movies:
        raise HTTPException(status_code=404, detail="No movies found")

    return [{"tmdbID": movie.tmdbID, "title": movie.title} for movie in movies]


@router.post("/add",
    response_model=MovieModel,
    response_description="Add a new movie",
    summary="Add Movie",
    description="Adds a new movie to the database."
)
async def add_movie(
    movie: MovieAdd,
    region: str,
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(admin_required)
):
    """
    Add a new movie to the database.

    - **Input**: Movie object containing the TMDB ID.
    - **Validation**: Fetches movie details from the TMDB API.
    - **Returns**: The added movie object.
    - **Raises**: HTTP error if the TMDB API request fails.
    """
    response = requests.get(
        f"{settings.TMDB_API_URL}/movie/{movie.tmdbID}?api_key={settings.TMDB_API_KEY}&language=en-US"
    )
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail="Error fetching data from TMDB API"
        )

    movie_data = response.json()
    try:
        validated_movie = MovieBase(
            tmdbID=movie.tmdbID,
            title=movie_data.get("title"),
            release_date=movie_data.get("release_date"),
            poster_path=movie_data.get("poster_path"),
            runtime=movie_data.get("runtime"),
            description=movie_data.get("overview")
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Validation error: {e.errors()}"
        )

    new_movie = Movie(
        tmdbID=validated_movie.tmdbID,
        title=validated_movie.title,
        release_date=validated_movie.release_date,
        poster_path=validated_movie.poster_path,
        runtime=validated_movie.runtime,
        description=validated_movie.description
    )
    db.add(new_movie)
    await db.commit()
    await db.refresh(new_movie)
    return new_movie


@router.get("/get/{movie_id}",
    response_model=MovieModel,
    response_description="Get movie by ID",
    summary="Get Movie by ID",
    description="Returns a movie by its ID."
)
async def get_movie_by_id(
    movie_id: int,
    region: str,
    db: AsyncSession = Depends(get_db_local)
):
    """
    Retrieve a movie by its ID.

    - **Input**: Movie ID.
    - **Returns**: The movie object if found.
    - **Raises**: HTTP 404 error if the movie is not found.
    """
    query = select(Movie).where(Movie.id == movie_id)
    result = await db.execute(query)
    movie = result.scalars().first()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    return movie


@router.get("/get",
    response_description="List of movies by city",
    summary="Fetch Movies by City",
    description="Retrieve movies based on the specified region."
)
async def get_movies_by_city(
    region: str,
    db: AsyncSession = Depends(get_db_local)
):
    """
    Retrieve movies based on the specified region.

    - **Input**: Region name ('krakow', 'warsaw').
    - **Returns**: A list of movies for the selected region or an empty list if no movies are found.
    - **Raises**: HTTP 400 error if the region is invalid.
    """
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail=f"Invalid region: {region}. Supported regions are 'krakow' and 'warsaw'.")

    query = select(Movie)
    result = await db.execute(query)
    movies = result.scalars().all()

    # Return an empty list if no movies are found
    return movies if movies else []
