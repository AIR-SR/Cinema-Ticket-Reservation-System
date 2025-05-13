from core import (
    admin_required,
    employee_required,
    get_db_local,
    get_db_global,
    user_required,
    logger,
)
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models_global import UsersGlobal
from models_local import (
    Reservation,
    Reservation_Seat,
    Seat,
    Hall_Row,
    Hall,
    Show,
    Movie,
)
from pydantic import ValidationError
from schemas import (
    ReservationSeatBase,
    ReservationSeatModel,
    ReservationBase,
    ReservationModel,
    UserReservationDetails,
    SeatDetails,
    MovieDetails,
    UserDetails,
)
from schemas import ReservationDetails
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, text, select, func
from datetime import datetime

router = APIRouter(prefix="/reservation", tags=["Reservation"])


async def check_reserved_seats(seat_ids: List[int], db: AsyncSession):
    """
    Check if any of the given seat IDs are already reserved.
    - **Input**: List of seat IDs.
    - **Raises**: HTTPException if any seat is already reserved.
    """
    existing_reservations = await db.execute(
        select(Reservation_Seat).where(Reservation_Seat.seat_id.in_(seat_ids))
    )
    if existing_reservations.scalars().first():
        raise HTTPException(
            status_code=400, detail="One or more seats are already reserved."
        )


async def create_reservation_entry(
    user_id: int, reservation_data: ReservationBase, seat_ids: List[int], db: AsyncSession
):
    """
    Create a reservation and associated reservation_seat entries in the database.
    - **Input**: User ID, reservation data, and seat IDs.
    - **Returns**: The newly created reservation object.
    """
    new_reservation = Reservation(
        user_id=user_id,
        show_id=reservation_data.show_id,
        status=reservation_data.status,
        created_at=reservation_data.created_at,
    )
    db.add(new_reservation)
    await db.flush()  # Flush to get the reservation ID

    reservation_seats = [
        Reservation_Seat(seat_id=seat_id, reservation_id=new_reservation.id)
        for seat_id in seat_ids
    ]
    db.add_all(reservation_seats)
    await db.commit()
    return new_reservation


async def validate_and_create_reservation(
    user_id: int, reservation: ReservationBase, seat_ids: List[int], db: AsyncSession
):
    """
    Validate seat availability and create a reservation.
    - **Input**: User ID, reservation data, and seat IDs.
    - **Returns**: The newly created reservation object.
    """
    try:
        if (
            isinstance(reservation.created_at, datetime)
            and reservation.created_at.tzinfo is not None
        ):
            reservation.created_at = reservation.created_at.replace(
                tzinfo=None)

        await check_reserved_seats(seat_ids, db)
        return await create_reservation_entry(user_id, reservation, seat_ids, db)
    except HTTPException as e:
        logger.error(f"HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.exception("Unexpected error occurred.")
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )


async def fetch_reservation_by_id(reservation_id: int, db: AsyncSession):
    """
    Fetch a reservation by its ID.
    - **Input**: Reservation ID.
    - **Returns**: The reservation object or None if not found.
    """
    reservation_query = await db.execute(
        select(Reservation).where(Reservation.id == reservation_id)
    )
    return reservation_query.scalars().first()


async def fetch_reservations_by_user(user_id: int, db: AsyncSession):
    """
    Fetch all reservations for a specific user.
    - **Input**: User ID.
    - **Returns**: A list of reservation objects.
    """
    reservations_query = await db.execute(
        select(Reservation).where(Reservation.user_id == user_id)
    )
    return reservations_query.scalars().all()


async def fetch_seat_hall_movie_details(reservation_ids: List[int], db: AsyncSession):
    """
    Fetch seat details, hall name, movie details, and show start time for given reservation IDs.
    - **Input**: List of reservation IDs.
    - **Returns**: Query result containing the details.
    """
    seat_hall_movie_query = await db.execute(
        select(
            Reservation_Seat.reservation_id,
            Seat.seat_number,
            Hall_Row.row_number,
            Hall.name.label("hall_name"),
            Movie.id.label("movie_id"),
            Movie.title.label("movie_title"),
            Movie.runtime.label("movie_runtime"),
            Show.start_time.label("show_start_time"),
        )
        .join(Reservation, Reservation.id == Reservation_Seat.reservation_id)
        .join(Seat, Reservation_Seat.seat_id == Seat.id)
        .join(Hall_Row, Seat.row_id == Hall_Row.id)
        .join(Show, Show.id == Reservation.show_id)
        .join(Hall, Show.hall_id == Hall.id)
        .join(Movie, Show.movie_id == Movie.id)
        .where(Reservation_Seat.reservation_id.in_(reservation_ids))
    )
    return seat_hall_movie_query.all()


@router.post(
    "/create",
    response_model=ReservationModel,
    response_description="Create a reservation",
    summary="Create a reservation",
    description="Create a reservation in the database. Returns the created reservation.",
)
async def create_reservation(
    reservation: ReservationBase,
    seat_ids: List[int],
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(user_required),
):
    """
    Create a reservation in the database.
    """
    return await validate_and_create_reservation(current_user.id, reservation, seat_ids, db)


@router.post(
    "/create-for-user/{user_id}",
    response_model=ReservationModel,
    response_description="Create a reservation for a specific user",
    summary="Create a reservation for a specific user",
    description="Create a reservation in the database for a specific user. Returns the created reservation.",
)
async def create_reservation_for_user(
    user_id: int,
    reservation: ReservationBase,
    seat_ids: List[int],
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(employee_required),
):
    """
    Create a reservation in the database for a specific user.
    """
    return await validate_and_create_reservation(user_id, reservation, seat_ids, db)


@router.get(
    "/get-all",
    response_model=List[ReservationModel],
    response_description="Get all reservations",
    summary="Get all reservations",
    description="Retrieve all reservations from the database. Returns a list of reservations.",
)
async def get_reservations(
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(employee_required),
):
    """
    Retrieve all reservations from the database.
    - **Returns**: A list of reservation objects.
    """
    result = await db.execute(select(Reservation))
    return result.scalars().all()


@router.get(
    "/my-reservations",
    response_model=List[ReservationDetails],
    response_description="Get all reservations for the current user with details",
    summary="Get all reservations for the current user with details",
    description="Retrieve all reservations for the current user from the database, including seat details, hall name, movie details, and show start time.",
)
async def get_my_reservations(
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(user_required),
):
    """
    Retrieve all reservations for the current user from the database, including seat details, hall name, movie details, and show start time.
    - **Returns**: A list of reservation objects with detailed information.
    """
    try:
        reservations = await fetch_reservations_by_user(current_user.id, db)

        if not reservations:
            return []

        reservation_ids = [reservation.id for reservation in reservations]
        seat_hall_movie_data = await fetch_seat_hall_movie_details(reservation_ids, db)

        # Organize seat details, hall name, movie details, and show start time by reservation ID
        reservation_details = {}
        for row in seat_hall_movie_data:
            if row.reservation_id not in reservation_details:
                reservation_details[row.reservation_id] = {
                    "seat_details": [],
                    "hall_name": row.hall_name,
                    "movie_details": {
                        "title": row.movie_title,
                        "runtime": row.movie_runtime,
                        "id": row.movie_id,
                    },
                    "show_start_time": row.show_start_time,
                }
            reservation_details[row.reservation_id]["seat_details"].append(
                {"seat_number": row.seat_number, "row_number": row.row_number}
            )

        return [
            {
                "reservation": reservation,
                **reservation_details.get(reservation.id, {}),
            }
            for reservation in reservations
        ]
    except Exception as e:
        logger.exception(
            "Unexpected error occurred while retrieving reservations with details."
        )
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )


@router.get(
    "/get-details/{reservation_id}",
    response_model=ReservationDetails,
    response_description="Get a reservation by ID",
    summary="Get a reservation by ID",
    description="Retrieve a reservation by its ID from the database. Returns the reservation along with seat numbers, hall name, movie details, and show start time.",
)
async def get_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(user_required),
):
    """
    Retrieve a reservation by its ID from the database.
    - **Input**: Reservation ID.
    - **Returns**: The reservation object along with seat numbers, hall name, movie details, and show start time.
    - **Raises**: HTTP error if the reservation is not found or access is denied.
    """
    try:
        reservation = await fetch_reservation_by_id(reservation_id, db)

        if not reservation:
            raise HTTPException(
                status_code=404, detail="Reservation not found.")

        if reservation.user_id != current_user.id:
            await employee_required(current_user)

        seat_hall_movie_data = await fetch_seat_hall_movie_details([reservation.id], db)

        if not seat_hall_movie_data:
            raise HTTPException(
                status_code=404, detail="Seat, hall, or movie details not found."
            )

        # Extract seat details, hall name, movie details, and show start time
        seat_details = [
            SeatDetails(seat_number=row.seat_number, row_number=row.row_number)
            for row in seat_hall_movie_data
        ]
        movie_details = MovieDetails(
            title=seat_hall_movie_data[0].movie_title,
            runtime=seat_hall_movie_data[0].movie_runtime,
            id=seat_hall_movie_data[0].movie_id,
        )

        return ReservationDetails(
            reservation=reservation,
            seat_details=seat_details,
            hall_name=seat_hall_movie_data[0].hall_name,
            movie_details=movie_details,
            show_start_time=seat_hall_movie_data[0].show_start_time,
        )
    except HTTPException as e:
        logger.error(f"HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.exception(
            "Unexpected error occurred while retrieving reservation details."
        )
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )


@router.get(
    "/user/{userId}/details/{reservationId}",
    response_model=UserReservationDetails,
    response_description="Get a user's reservation by ID",
    summary="Get a user's reservation by ID",
    description="Retrieve a user's reservation by its ID from the database. Returns the reservation along with seat numbers, hall name, movie details, show start time, and user name.",
)
async def get_user_reservation_details(
    userId: int,
    reservationId: int,
    db: AsyncSession = Depends(get_db_local),
    db_global: AsyncSession = Depends(get_db_global),
    current_user: UsersGlobal = Depends(employee_required),
):
    """
    Retrieve a user's reservation by its ID from the database.
    - **Input**: User ID and Reservation ID.
    - **Returns**: The reservation object along with seat numbers, hall name, movie details, show start time, and user name.
    - **Raises**: HTTP error if the reservation is not found or access is denied.
    """
    try:
        reservation = await fetch_reservation_by_id(reservationId, db)

        if not reservation or reservation.user_id != userId:
            raise HTTPException(
                status_code=404, detail="Reservation not found.")

        # Fetch user details from global DB
        user_query = await db_global.execute(
            select(
                UsersGlobal.first_name,
                UsersGlobal.last_name,
                UsersGlobal.username,
                UsersGlobal.email,
            ).where(UsersGlobal.id == userId)
        )
        user_details = user_query.first()
        if not user_details:
            raise HTTPException(status_code=404, detail="User not found.")

        seat_hall_movie_data = await fetch_seat_hall_movie_details([reservation.id], db)

        if not seat_hall_movie_data:
            raise HTTPException(
                status_code=404, detail="Seat, hall, or movie details not found."
            )

        # Extract seat details, hall name, movie details, and show start time
        seat_details = [
            SeatDetails(seat_number=row.seat_number, row_number=row.row_number)
            for row in seat_hall_movie_data
        ]
        movie_details = MovieDetails(
            title=seat_hall_movie_data[0].movie_title,
            runtime=seat_hall_movie_data[0].movie_runtime,
            id=seat_hall_movie_data[0].movie_id,
        )
        user_details = UserDetails(
            first_name=user_details.first_name,
            last_name=user_details.last_name,
            username=user_details.username,
            email=user_details.email,
        )

        return UserReservationDetails(
            reservation=reservation,
            seat_details=seat_details,
            hall_name=seat_hall_movie_data[0].hall_name,
            movie_details=movie_details,
            show_start_time=seat_hall_movie_data[0].show_start_time,
            user_details=user_details,
        )
    except HTTPException as e:
        logger.error(f"HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.exception(
            "Unexpected error occurred while retrieving user reservation details."
        )
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )


@router.delete(
    "/delete/{reservation_id}",
    response_description="Delete a reservation by ID",
    summary="Delete a reservation by ID",
    description="Delete a reservation from the database by its ID. Only accessible by admins.",
)
async def delete_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(admin_required),
):
    """
    Delete a reservation from the database by its ID.
    - **Input**: Reservation ID.
    - **Validation**: Ensures the current user is an admin.
    - **Returns**: A success message if the reservation is deleted.
    - **Raises**: HTTP error if the reservation is not found.
    """
    logger.info(
        f"Admin {current_user.id} attempting to delete reservation ID: {reservation_id}"
    )
    try:
        reservation = await fetch_reservation_by_id(reservation_id, db)

        if not reservation:
            logger.warning(f"Reservation ID {reservation_id} not found.")
            raise HTTPException(
                status_code=404, detail="Reservation not found.")

        await db.execute(
            delete(Reservation_Seat).where(
                Reservation_Seat.reservation_id == reservation_id
            )
        )
        await db.execute(delete(Reservation).where(Reservation.id == reservation_id))
        await db.commit()

        logger.info(
            f"Reservation ID {reservation_id} deleted successfully by admin {current_user.id}."
        )
        return {"message": f"Reservation ID {reservation_id} deleted successfully."}
    except HTTPException as e:
        logger.error(f"HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.exception(
            "Unexpected error occurred while deleting the reservation.")
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )
