from datetime import datetime

import requests
from core import admin_required, get_db_local, settings
from fastapi import APIRouter, Depends, HTTPException
from models_global import UsersGlobal
from models_local import Movie
from pydantic import ValidationError
from schemas import MovieAdd, MovieBase, MovieModel, MovieTitle
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

router = APIRouter(prefix="/movies", tags=["Movies"])


@router.post(
    "/add",
    response_model=MovieModel,
    response_description="Add a new movie",
    summary="Add Movie",
    description="Adds a new movie to the database.",
)
async def add_movie(
    movie: MovieAdd,
    region: str,
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(admin_required),
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

    # Check if tmdbID already exists in the database
    existing_movie_query = select(Movie).where(Movie.tmdbID == movie.tmdbID)
    existing_movie_result = await db.execute(existing_movie_query)
    existing_movie = existing_movie_result.scalars().first()
    if existing_movie:
        raise HTTPException(
            status_code=400,
            detail=f"Movie with tmdbID {movie.tmdbID} already exists in the database.",
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code, detail="Error fetching data from TMDB API"
        )

    movie_data = response.json()
    genres_list = [genre["name"] for genre in movie_data.get("genres", [])]
    try:
        validated_movie = MovieBase(
            tmdbID=movie.tmdbID,
            title=movie_data.get("title"),
            release_date=datetime.strptime(
                movie_data.get("release_date"), "%Y-%m-%d"
            ).date(),  # Convert to date object
            poster_path=movie_data.get("poster_path"),
            runtime=movie_data.get("runtime"),
            description=movie_data.get("overview"),
            genres=genres_list,
        )
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e.errors()}")

    new_movie = Movie(
        tmdbID=validated_movie.tmdbID,
        title=validated_movie.title,
        release_date=validated_movie.release_date,
        poster_path=validated_movie.poster_path,
        runtime=validated_movie.runtime,
        description=validated_movie.description,
        genres=validated_movie.genres,
    )
    db.add(new_movie)
    await db.commit()
    await db.refresh(new_movie)
    return new_movie


@router.get(
    "/get",
    response_model=list[MovieModel],
    response_description="List of movies by city",
    summary="Fetch Movies by City",
    description="Retrieve movies based on the specified region.",
)
async def get_movies(region: str, db: AsyncSession = Depends(get_db_local)):
    """
    Retrieve movies based on the specified region.

    - **Input**: Region name ('krakow', 'warsaw').
    - **Returns**: A list of movies for the selected region.
    - **Raises**: HTTP 400 error if the region is invalid.
    """
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid region: {region}. Supported regions are 'krakow' and 'warsaw'.",
        )

    query = select(Movie)
    result = await db.execute(query)
    movies = result.scalars().all()

    return movies


@router.get(
    "/get_title",
    response_model=list[MovieTitle],
    response_description="List of movies title by city",
    summary="Fetch Movies by City",
    description="Retrieve movies based on the specified region.",
)
async def get_movies_title(region: str, db: AsyncSession = Depends(get_db_local)):
    """
    Retrieve movies based on the specified region.

    - **Input**: Region name ('krakow', 'warsaw').
    - **Returns**: A list of movies title for the selected region.
    - **Raises**: HTTP 400 error if the region is invalid.
    """
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid region: {region}. Supported regions are 'krakow' and 'warsaw'.",
        )

    query = select(Movie)
    result = await db.execute(query)
    movies = result.scalars().all()

    return [{"id": movie.id, "title": movie.title} for movie in movies]


@router.get(
    "/get/{movie_id}",
    response_model=MovieModel,
    response_description="Get movie by ID",
    summary="Get Movie by ID",
    description="Returns a movie by its ID.",
)
async def get_movie_by_id(
    movie_id: int, region: str, db: AsyncSession = Depends(get_db_local)
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
