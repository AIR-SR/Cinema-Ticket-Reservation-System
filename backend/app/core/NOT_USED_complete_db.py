import requests
from sqlalchemy.future import select
from models_local import Movie
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from .config import settings
import os

# Konfiguracja API TMDB
TMDB_API_KEY = settings.TMDB_API_KEY
TMDB_API_BASE_URL = settings.TMDB_API_URL


# Funkcja do pobierania filmów, które są teraz w kinach
async def get_now_playing_movies():
    url = f"{TMDB_API_BASE_URL}/movie/now_playing"
    params = {"api_key": TMDB_API_KEY, "language": "pl-PL", "page": 1}
    response = requests.get(url, params=params)

    if response.status_code == 200:
        return response.json().get("results", [])[:10]  # Pobierz 10 filmów
    else:
        raise HTTPException(status_code=response.status_code, detail="Błąd pobierania danych z API")


# Funkcja do zapisania filmów do bazy danych
async def save_movies_to_db(movies: list, db: AsyncSession):
    try:
        for movie in movies:
            # Sprawdź, czy film już istnieje w bazie
            stmt = select(Movie).filter(Movie.tmdbID == movie["id"])
            result = await db.execute(stmt)
            existing_movie = result.scalars().first()

            if not existing_movie:  # Jeśli film nie istnieje w bazie, dodaj go
                new_movie = Movie(
                    tmdbID=movie.get("id"),
                    title=movie.get("title"),
                    release_date=movie.get("release_date"),
                    poster_path=movie.get("poster_path"),
                    runtime=movie.get("runtime"),
                    genres=movie.get("genres"),
                    description=movie.get("overview")
                    )
                db.add(new_movie)
                await db.commit()
                await db.refresh(new_movie)
            else:
                print(f"Film {movie['title']} już istnieje w bazie.")
    except Exception as e:
        print(f"Błąd zapisywania filmów do bazy: {e}")