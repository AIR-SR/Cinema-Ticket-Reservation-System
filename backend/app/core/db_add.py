import requests

from config import settings

BASE_URL = "http://localhost:8000"
TMDB_API_KEY = settings.TMDB_API_KEY
TMDB_API_BASE_URL = settings.TMDB_API_URL
ADMIN_PASSWORD = settings.ADMIN_PASSWORD


def get_now_playing_movies(page: int = 1):
    url = f"{TMDB_API_BASE_URL}/movie/now_playing"
    params = {"api_key": TMDB_API_KEY, "language": "pl-PL", "page": page}
    response = requests.get(url, params=params)

    if response.status_code == 200:
        return response.json().get("results", [])
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
    credentials = {
        "username": "admin",
        "password": ADMIN_PASSWORD,
    }  # Replace with actual credentials
    # Use form data instead of JSON
    response = requests.post(f"{BASE_URL}/login/", data=credentials)
    response.raise_for_status()
    return response.json()["access_token"]


def populate_db():
    token = login()
    headers = {"Authorization": f"Bearer {token}"}

    movies = get_now_playing_movies(1)
    movies += get_now_playing_movies(2)
    movie_data = []
    for movie in movies:
        movie_details = get_movie_details(movie["id"])
        movie_data.append(
            {
                "tmdbID": movie_details.get("id"),
            }
        )
    movies_krakow = movie_data[0:20]
    movies_warsaw = movie_data[20:40]

    print(movies_krakow)
    print(movies_warsaw)

    # Add movies for Krakow
    for movie in movies_krakow:
        response = requests.post(
            f"{BASE_URL}/movies/add?region=krakow", json=movie, headers=headers
        )
        if response.status_code == 200:
            print(f"Added movie {movie['tmdbID']} to Krakow")
        else:
            print(
                f"Failed to add movie {movie['tmdbID']} to Krakow: {response.text}")
    # Add movies for Warszawa
    for movie in movies_warsaw:
        response = requests.post(
            f"{BASE_URL}/movies/add?region=warsaw", json=movie, headers=headers
        )
        if response.status_code == 200:
            print(f"Added movie {movie['tmdbID']} to Warszawa")
        else:
            print(
                f"Failed to add movie {movie['tmdbID']} to Warszawa: {response.text}")

    print("Database populated successfully.")


def add_halls_and_rows():
    token = login()
    headers = {"Authorization": f"Bearer {token}"}

    # Define halls and rows for Krakow and Warsaw
    halls_data = {
        "krakow": [
            {"name": "Sala 1", "rows": [
                {"row_number": 1, "seat_count": 10},
                {"row_number": 2, "seat_count": 12},
                {"row_number": 3, "seat_count": 14},
                {"row_number": 4, "seat_count": 16},
            ]},
            {"name": "Sala 2", "rows": [
                {"row_number": 1, "seat_count": 8},
                {"row_number": 2, "seat_count": 10},
                {"row_number": 3, "seat_count": 12},
                {"row_number": 4, "seat_count": 14},
            ]},
        ],
        "warsaw": [
            {"name": "Sala 1", "rows": [
                {"row_number": 1, "seat_count": 15},
                {"row_number": 2, "seat_count": 20},
                {"row_number": 3, "seat_count": 18},
                {"row_number": 4, "seat_count": 22},
            ]},
            {"name": "Sala 2", "rows": [
                {"row_number": 1, "seat_count": 10},
                {"row_number": 2, "seat_count": 12},
                {"row_number": 3, "seat_count": 14},
                {"row_number": 4, "seat_count": 16},
            ]},
        ],
    }

    for region, halls in halls_data.items():
        for hall in halls:
            # Add hall
            hall_response = requests.post(
                f"{BASE_URL}/halls/add?region={region}",
                json={"name": hall["name"]},
                headers=headers,
            )
            if hall_response.status_code == 200:
                hall_id = hall_response.json()["id"]
                print(
                    f"Added hall '{hall['name']}' in {region} with ID {hall_id}")

                # Add rows for the hall
                rows_payload = [
                    {"hall_id": hall_id,
                        "row_number": row["row_number"], "seat_count": row["seat_count"]}
                    for row in hall["rows"]
                ]
                rows_response = requests.post(
                    f"{BASE_URL}/hall_rows/add-rows?region={region}",
                    json=rows_payload,
                    headers=headers,
                )
                if rows_response.status_code == 200:
                    print(f"Added rows for hall '{hall['name']}' in {region}")
                else:
                    print(
                        f"Failed to add rows for hall '{hall['name']}' in {region}: {rows_response.text}")
            else:
                print(
                    f"Failed to add hall '{hall['name']}' in {region}: {hall_response.text}")


def add_seats_to_rows():
    token = login()
    headers = {"Authorization": f"Bearer {token}"}

    # Define seats for each row
    seats_data = {
        "krakow": [
            {"row_id": 1, "seats": [
                {"seat_number": i, "seat_type": "standard"} for i in range(1, 11)]},
            {"row_id": 2, "seats": [
                {"seat_number": i, "seat_type": "standard"} for i in range(1, 13)]},
            {"row_id": 3, "seats": [
                {"seat_number": i, "seat_type": "premium"} for i in range(1, 15)]},
            {"row_id": 4, "seats": [
                {"seat_number": i, "seat_type": "premium"} for i in range(1, 17)]},
        ],
        "warsaw": [
            {"row_id": 5, "seats": [
                {"seat_number": i, "seat_type": "standard"} for i in range(1, 16)]},
            {"row_id": 6, "seats": [
                {"seat_number": i, "seat_type": "standard"} for i in range(1, 21)]},
            {"row_id": 7, "seats": [
                {"seat_number": i, "seat_type": "premium"} for i in range(1, 19)]},
            {"row_id": 8, "seats": [
                {"seat_number": i, "seat_type": "premium"} for i in range(1, 23)]},
        ],
    }

    for region, rows in seats_data.items():
        for row in rows:
            seats_payload = [
                {"row_id": row["row_id"], "seat_number": seat["seat_number"],
                    "seat_type": seat["seat_type"]}
                for seat in row["seats"]
            ]
            response = requests.post(
                f"{BASE_URL}/seat/add-seats?region={region}",
                json=seats_payload,
                headers=headers,
            )
            if response.status_code == 200:
                print(f"Added seats to row {row['row_id']} in {region}")
            else:
                print(
                    f"Failed to add seats to row {row['row_id']} in {region}: {response.text}")


def main():
    populate_db()
    add_halls_and_rows()
    add_seats_to_rows()


if __name__ == "__main__":
    main()
