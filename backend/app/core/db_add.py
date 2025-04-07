import requests

from config import settings

BASE_URL = "http://localhost:8000"
TMDB_API_KEY = settings.TMDB_API_KEY
TMDB_API_BASE_URL = settings.TMDB_API_URL


def get_now_playing_movies():
    url = f"{TMDB_API_BASE_URL}/movie/now_playing"
    params = {"api_key": TMDB_API_KEY, "language": "pl-PL", "page": 1}
    response = requests.get(url, params=params)

    if response.status_code == 200:
        return response.json().get("results", [])[:20]  # Pobierz 10 filmów
    else:
        raise ValueError(
            f"Błąd pobierania danych z API: {response.status_code}")


def get_movie_details(movie_id: int):
    url = f"{TMDB_API_BASE_URL}/movie/{movie_id}"
    params = {"api_key": TMDB_API_KEY, "language": "pl-PL"}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return {}


def login():
    """Authenticate and retrieve a token."""
    credentials = {"username": "admin",
                   "password": "admin"}  # Replace with actual credentials
    # Use form data instead of JSON
    response = requests.post(f"{BASE_URL}/login/", data=credentials)
    response.raise_for_status()
    return response.json()["access_token"]


def populate_db():
    token = login()
    headers = {"Authorization": f"Bearer {token}"}

    movies = get_now_playing_movies()
    movie_data = []
    for movie in movies:
        movie_details = get_movie_details(movie["id"])
        movie_data.append({
            "tmdbID": movie_details.get("id"),
        })

    movies_krakow = movie_data[0:10]
    movies_warsaw = movie_data[10:20]

    print(movies_krakow)
    print(movies_warsaw)

    # Add movies for Krakow
    for movie in movies_krakow:
        response = requests.post(
            f"{BASE_URL}/movies/add?region=krakow", json=movie, headers=headers)
        if response.status_code == 200:
            print(f"Added movie {movie['tmdbID']} to Krakow")
        else:
            print(
                f"Failed to add movie {movie['tmdbID']} to Krakow: {response.text}")
    # Add movies for Warszawa
    for movie in movies_warsaw:
        response = requests.post(
            f"{BASE_URL}/movies/add?region=warsaw", json=movie, headers=headers)
        if response.status_code == 200:
            print(f"Added movie {movie['tmdbID']} to Warszawa")
        else:
            print(
                f"Failed to add movie {movie['tmdbID']} to Warszawa: {response.text}")

    print("Database populated successfully.")


def main():
    populate_db()


if __name__ == "__main__":
    main()
