import requests
from sqlalchemy.future import select
from models_local import Movie
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from .config import settings
import os
import httpx
from datetime import datetime

TMDB_API_KEY = os.getenv('TMDB_API_KEY')
TMDB_API_BASE_URL = settings.TMDB_API_URL


# Funkcja do pobierania filmów, które są teraz w kinach


async def get_now_playing_movies():
    url = f"{TMDB_API_BASE_URL}/movie/now_playing"
    params = {"api_key": TMDB_API_KEY, "language": "pl-PL", "page": 1}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    if response.status_code == 200:
        return response.json().get("results", [])[:10]
    else:
        raise HTTPException(status_code=response.status_code, detail="Błąd pobierania danych z API")


async def get_movie_details(movie_id: int):
    url = f"{TMDB_API_BASE_URL}/movie/{movie_id}"
    params = {"api_key": TMDB_API_KEY, "language": "pl-PL"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return {}


# Funkcja do zapisania filmów do bazy danych
async def save_movies_to_db(movies: list, db: AsyncSession):
    try:
        for movie in movies:
            stmt = select(Movie).filter(Movie.tmdbID == movie["id"])
            result = await db.execute(stmt)
            existing_movie = result.scalars().first()
            details = await get_movie_details(movie["id"])
            print(movie)
            if not existing_movie:
                release_date = datetime.strptime(movie.get("release_date"), "%Y-%m-%d").date() if movie.get("release_date") else None

                new_movie = Movie(
                    tmdbID=movie.get("id"),
                    title=movie.get("title"),
                    release_date=release_date,
                    poster_path=movie.get("poster_path"),
                    runtime=details.get("runtime"),
                    genres=[g["name"] for g in details.get("genres", [])],
                    description=movie.get("overview")
                )
                db.add(new_movie)
                print(f"Próba dodania filmu: {movie['title']}")
                await db.commit()  # Upewnij się, że commit jest wywoływany!
                await db.refresh(new_movie)
                print(f"Film {movie['title']} dodany do bazy.")
            else:
                print(f"Film {movie['title']} już istnieje w bazie.")
    except Exception as e:
        print(f"Błąd zapisywania filmów do bazy: {e}")

