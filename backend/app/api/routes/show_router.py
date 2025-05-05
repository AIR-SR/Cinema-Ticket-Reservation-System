from core import admin_required, get_db_local, settings, employee_required
from fastapi import APIRouter, Depends, HTTPException
from models_global import UsersGlobal
from models_local import Show, Movie, Hall, Reservation, Reservation_Seat, Seat
from schemas import ShowBase, ShowModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, func, cast, TIMESTAMP
from datetime import datetime, timedelta, date, timezone


router = APIRouter(prefix="/show", tags=["Shows"])


@router.get("/get",
            response_model=list[ShowModel],
            response_description="Retrieve list of shows",
            summary="Fetch Shows",
            description="Fetch a list of shows stored in the database."
            )
async def get_shows(region: str, db: AsyncSession = Depends(get_db_local)):
    """
    Retrieve a list of shows stored in the database.

    - **Input**: Region name ('krakow', 'warsaw').
    - **Returns**: A list of shows with their IDs and names.
    - **Raises**: HTTP 404 error if no shows are found.
    """

    if region not in ["krakow", "warsaw"]:
        raise HTTPException(
            status_code=400, detail=f"Invalid region: {region}. Supported regions are 'krakow' and 'warsaw'.")

    query = select(Show)
    result = await db.execute(query)
    shows = result.scalars().all()

    return shows


@router.post("/add",
             response_model=ShowModel,
             response_description="Add a new show",
             summary="Add Show",
             description="Adds a new show to the database."
             )
async def add_show(show: ShowBase, region: str, db: AsyncSession = Depends(get_db_local), current_user: UsersGlobal = Depends(admin_required)):
    """
    Add a new show to the database.

    - **Input**: Show object containing the show details.
    - **Validation**: Checks if the show already exists in the database.
    - **Returns**: The added show object.
    - **Raises**: HTTP error if the show already exists.
    """

    new_show = Show(**show.model_dump())
    db.add(new_show)
    await db.commit()
    await db.refresh(new_show)

    return new_show


@router.get("/get/{show_id}",
            response_model=ShowModel,
            response_description="Retrieve show details",
            summary="Fetch Show Details",
            description="Fetch details of a specific show by ID."
            )
async def get_show(show_id: int, region: str, db: AsyncSession = Depends(get_db_local)):
    """
    Retrieve details of a specific show by ID.

    - **Input**: Show ID.
    - **Returns**: Show object with its details.
    - **Raises**: HTTP 404 error if the show is not found.
    """
    query = select(Show).where(Show.id == show_id)
    result = await db.execute(query)
    show = result.scalars().first()

    if not show:
        raise HTTPException(status_code=404, detail="Show not found")

    return show


@router.delete("/delete/{show_id}", status_code=204)
async def delete_show(
    show_id: int,
    region: str,
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(admin_required)
):
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail="Invalid region.")

    show = await db.get(Show, show_id)
    if not show:
        raise HTTPException(status_code=404, detail="Show not found.")

    # Delete the show itself
    await db.delete(show)
    await db.commit()

    # Reset sequence if no shows remain
    result = await db.execute(select(func.count()).select_from(Show))
    show_count = result.scalar()

    if show_count == 0:
        await db.execute(text("ALTER SEQUENCE shows_id_seq RESTART WITH 1"))

    return {"detail": "Show deleted successfully."}


@router.get("/get_details")
async def get_shows(region: str, db: AsyncSession = Depends(get_db_local)):
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail="Invalid region")

    query = select(Show, Movie.title, Hall.name).join(Movie).join(Hall)
    result = await db.execute(query)
    shows = result.all()

    shows_data = [
        {
            "id": show.id,
            "movie_title": title,
            "start_time": show.start_time,
            "hall_name": hall,
            "price": f"{show.price:.2f}",
            "region": region
        }
        for show, title, hall in shows
    ]

    return shows_data


@router.get("/check_conflict")
async def check_show_conflict(
    hall_id: int,
    movie_id: int,
    start_time: datetime,
    region: str,
    db: AsyncSession = Depends(get_db_local),
):

    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail="Invalid region")

    movie_stmt = select(Movie.runtime).where(Movie.id == movie_id)
    result = await db.execute(movie_stmt)
    movie_runtime = result.scalar()

    if movie_runtime is None:
        raise HTTPException(status_code=404, detail="Movie not found")

    new_start = start_time
    new_end = new_start + timedelta(minutes=movie_runtime)

    stmt = (
        select(Show, Movie.title, Movie.runtime)
        .join(Movie)
        .where(Show.hall_id == hall_id)
    )

    result = await db.execute(stmt)
    rows = result.all()

    conflicts = []

    for show, title, runtime in rows:
        existing_start = show.start_time
        existing_end = existing_start + \
            timedelta(minutes=runtime) + \
            timedelta(minutes=15)  # add 15 minutes after movie

        if (
            (new_start >= existing_start and new_start < existing_end) or
            (new_end > existing_start and new_end <= existing_end) or
            (new_start <= existing_start and new_end >= existing_end)
        ):
            conflicts.append({
                "show_id": show.id,
                "movie_title": title,
                "start_time": show.start_time,
                "end_time": existing_end,
            })

    return {
        "conflict": len(conflicts) > 0,
        "conflicts": conflicts
    }


@router.get("/movies_with_shows")
async def get_movies_with_shows(region: str, db: AsyncSession = Depends(get_db_local)):
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail="Invalid region")

    current_time = datetime.now(timezone.utc).replace(tzinfo=None)

    stmt = (
        select(Movie, Show)
        .join(Show, Movie.id == Show.movie_id)
        .where(Show.start_time > current_time)  # Use timezone-naive datetime
    )
    result = await db.execute(stmt)
    rows = result.all()

    movie_map = {}
    for movie, show in rows:
        if movie.id not in movie_map:
            movie_map[movie.id] = {
                "id": movie.id,
                "title": movie.title,
                "poster_path": movie.poster_path,
                "shows": [],
            }
        movie_map[movie.id]["shows"].append({
            "id": show.id,
            "start_time": show.start_time.isoformat(),
        })

    return list(movie_map.values())


@router.get("/get_by_hall_and_date/{hall_id}")
async def get_shows_by_hall_and_date(
    hall_id: int,
    date: date,
    region: str,
    db: AsyncSession = Depends(get_db_local),
):
    """
    Retrieve shows for a specific hall and date.

    - **Input**: Hall ID (path parameter), date, and region.
    - **Returns**: List of shows with their start times and durations.
    - **Raises**: HTTP 404 error if no shows are found.
    """
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail="Invalid region.")

    # Convert date to datetime objects for start and end of the day
    start_of_day = datetime.combine(date, datetime.min.time())
    end_of_day = start_of_day + timedelta(days=1) - timedelta(seconds=1)

    query = (
        select(Show, Movie.runtime, Movie.title)
        .join(Movie)
        .where(Show.hall_id == hall_id)
        .where(Show.start_time.between(start_of_day, end_of_day))
    )
    result = await db.execute(query)
    shows = result.all()

    if not shows:
        return []

    return [
        {
            "start_time": show.start_time,
            "duration": runtime,
            "movie_title": title,
        }
        for show, runtime, title in shows
    ]


@router.get("/get-for-reservation/{show_id}")
async def get_show_for_reservation(
    show_id: int,
    region: str,
    db: AsyncSession = Depends(get_db_local),
):
    """
    Retrieve show details for reservation, including movie and hall details.

    - **Input**: Show ID (path parameter) and region.
    - **Returns**: Show object with its details, movie details, and hall details.
    - **Raises**: HTTP 404 error if the show is not found.
    """
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail="Invalid region.")

    query = (
        select(Show, Movie, Hall)
        .join(Movie, Show.movie_id == Movie.id)
        .join(Hall, Show.hall_id == Hall.id)
        .where(Show.id == show_id)
    )
    result = await db.execute(query)
    row = result.first()

    if not row:
        raise HTTPException(status_code=404, detail="Show not found")

    show, movie, hall = row

    return {
        "show": {
            "id": show.id,
            "start_time": show.start_time,
            "price": show.price,
        },
        "movie": {
            "id": movie.id,
            "title": movie.title,
            "runtime": movie.runtime,
            "poster_path": movie.poster_path,
        },
        "hall": {
            "id": hall.id,
            "name": hall.name,
        },
    }


@router.get("/get_reserved_seats/{show_id}")
async def get_reserved_seats(
    show_id: int,
    region: str,
    db: AsyncSession = Depends(get_db_local),
):
    """
    Retrieve reserved seats for a specific show.

    - **Input**: Show ID (path parameter) and region.
    - **Returns**: List of reserved seat IDs.
    - **Raises**: HTTP 404 error if the show is not found.
    """
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail="Invalid region.")

    query = (
        select(Seat.id)
        .join(Reservation_Seat, Seat.id == Reservation_Seat.seat_id)
        .join(Reservation, Reservation.id == Reservation_Seat.reservation_id)
        .where(Reservation.show_id == show_id)
    )
    result = await db.execute(query)
    reserved_seats = result.scalars().all()

    if not reserved_seats:
        raise HTTPException(
            status_code=404, detail="No reserved seats found for the show.")

    return reserved_seats
