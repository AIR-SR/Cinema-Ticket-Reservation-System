import asyncio
from core import save_movies_to_db, get_now_playing_movies, get_db_local


print("⏳ Uruchamiam pobieranie filmów...")
async def main():
    for city in ["krakow", "warsaw"]:
        print("🔌 Połączono z bazą danych dla:", city)
        async for db in get_db_local(city):
            movies = await get_now_playing_movies()
            print("Filmy z API:", movies)
            if movies:
                await save_movies_to_db(movies, db)
                print(f"[{city}] Dodano {len(movies)} filmów.")
            else:
                print(f"[{city}] Brak filmów do dodania.")
            break

if __name__ == "__main__":
    asyncio.run(main())
