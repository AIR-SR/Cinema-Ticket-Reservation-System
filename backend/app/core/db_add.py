import requests

BASE_URL = "http://localhost:8000"

def login():
    """Authenticate and retrieve a token."""
    credentials = {"username": "admin", "password": "admin"}  # Replace with actual credentials
    response = requests.post(f"{BASE_URL}/login/", data=credentials)  # Use form data instead of JSON
    response.raise_for_status()
    return response.json()["access_token"]

def populate_db():
    token = login()
    headers = {"Authorization": f"Bearer {token}"}

    movies_krakow = [
        {"tmdbID": 950387},
        {"tmdbID": 1229730},
        {"tmdbID": 1197306},
        {"tmdbID": 822119},
    ]
    movies_warszawa = [
        {"tmdbID": 1165067},
        {"tmdbID": 1020414},
        {"tmdbID": 1388366},
        {"tmdbID": 1020414},
    ]

    # Add movies for Krakow
    for movie in movies_krakow:
        response = requests.post(f"{BASE_URL}/movies/add?region=krakow", json=movie, headers=headers)
        if response.status_code == 200:
            print(f"Added movie {movie['tmdbID']} to Krakow")
        else:
            print(f"Failed to add movie {movie['tmdbID']} to Krakow: {response.text}")
    # Add movies for Warszawa
    for movie in movies_warszawa:
        response = requests.post(f"{BASE_URL}/movies/add?region=warsaw", json=movie, headers=headers)
        if response.status_code == 200:
            print(f"Added movie {movie['tmdbID']} to Warszawa")
        else:
            print(f"Failed to add movie {movie['tmdbID']} to Warszawa: {response.text}")

def main():
    populate_db()
    print("Database populated successfully.")

if __name__ == "__main__":
    main()