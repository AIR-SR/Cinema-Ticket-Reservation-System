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
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, text, select, func
from datetime import datetime

router = APIRouter(prefix="/reservation", tags=["Reservation"])


@router.post(
    "/create",
    response_model=ReservationModel,
    response_description="Create a reservation",
    summary="Create a reservation",
    description="Create a reservation in the database. Returns the created reservation.",
)
async def create_reservation(
    reservation: ReservationBase,
    seat_ids: List[int],  # Add a list of seat IDs to reserve
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(user_required),
):
    """
    Create a reservation in the database.
    - **Input**: A reservation object and a list of seat IDs to reserve.
    - **Validation**: Ensures no duplicate reservation exists for the given seats in the DB.
    - **Returns**: The newly created reservation object.
    - **Raises**: HTTP error if any seat is already reserved.
    """
    logger.info(
        f"Creating reservation for user {current_user.id} with data: {reservation} and seat IDs: {seat_ids}"
    )
    try:
        # Convert created_at to offset-naive datetime
        if (
            isinstance(reservation.created_at, datetime)
            and reservation.created_at.tzinfo is not None
        ):
            reservation.created_at = reservation.created_at.replace(tzinfo=None)

        # Check if any of the seats are already reserved
        existing_reservations = await db.execute(
            select(Reservation_Seat).where(Reservation_Seat.seat_id.in_(seat_ids))
        )
        if existing_reservations.scalars().first():
            logger.warning(
                f"Reservation failed: One or more seats are already reserved. Seat IDs: {seat_ids}"
            )
            raise HTTPException(
                status_code=400, detail="One or more seats are already reserved."
            )

        # Create the reservation
        new_reservation = Reservation(
            user_id=current_user.id,
            show_id=reservation.show_id,
            status=reservation.status,
            created_at=reservation.created_at,
        )
        db.add(new_reservation)
        await db.flush()  # Flush to get the reservation ID

        # Create reservation_seat entries
        reservation_seats = [
            Reservation_Seat(seat_id=seat_id, reservation_id=new_reservation.id)
            for seat_id in seat_ids
        ]
        db.add_all(reservation_seats)
        await db.commit()

        logger.info(f"Reservation created successfully with ID: {new_reservation.id}")
        return new_reservation
    except ValidationError as e:
        logger.error(f"Validation error while creating reservation: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException as e:
        # Re-raise HTTP exceptions to avoid overwriting
        logger.error(f"HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.exception("Unexpected error occurred while creating the reservation.")
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )


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
    seat_ids: List[int],  # Add a list of seat IDs to reserve
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(employee_required),
):
    """
    Create a reservation in the database for a specific user.
    - **Input**: User ID, a reservation object, and a list of seat IDs to reserve.
    - **Validation**: Ensures no duplicate reservation exists for the given seats in the DB.
    - **Returns**: The newly created reservation object.
    - **Raises**: HTTP error if any seat is already reserved.
    """
    logger.info(
        f"Employee {current_user.id} creating reservation for user {user_id} with data: {reservation} and seat IDs: {seat_ids}"
    )
    try:
        # Convert created_at to offset-naive datetime
        if (
            isinstance(reservation.created_at, datetime)
            and reservation.created_at.tzinfo is not None
        ):
            reservation.created_at = reservation.created_at.replace(tzinfo=None)

        # Check if any of the seats are already reserved
        existing_reservations = await db.execute(
            select(Reservation_Seat).where(Reservation_Seat.seat_id.in_(seat_ids))
        )
        if existing_reservations.scalars().first():
            logger.warning(
                f"Reservation failed: One or more seats are already reserved. Seat IDs: {seat_ids}"
            )
            raise HTTPException(
                status_code=400, detail="One or more seats are already reserved."
            )

        # Create the reservation
        new_reservation = Reservation(
            user_id=user_id,
            show_id=reservation.show_id,
            status=reservation.status,
            created_at=reservation.created_at,
        )
        db.add(new_reservation)
        await db.flush()  # Flush to get the reservation ID

        # Create reservation_seat entries
        reservation_seats = [
            Reservation_Seat(seat_id=seat_id, reservation_id=new_reservation.id)
            for seat_id in seat_ids
        ]
        db.add_all(reservation_seats)
        await db.commit()

        logger.info(f"Reservation created successfully with ID: {new_reservation.id}")
        return new_reservation
    except ValidationError as e:
        logger.error(f"Validation error while creating reservation: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException as e:
        # Re-raise HTTP exceptions to avoid overwriting
        logger.error(f"HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.exception("Unexpected error occurred while creating the reservation.")
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )


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
        # Fetch reservations for the current user
        reservations_query = await db.execute(
            select(Reservation).where(Reservation.user_id == current_user.id)
        )
        reservations = reservations_query.scalars().all()

        if not reservations:
            return []

        # Fetch seat details, hall name, movie details, and show start time for all reservations
        reservation_ids = [reservation.id for reservation in reservations]
        seat_hall_movie_query = await db.execute(
            select(
                Reservation_Seat.reservation_id,
                Seat.seat_number,
                Hall_Row.row_number,
                Hall.name.label("hall_name"),
                Movie.title.label("movie_title"),
                Movie.runtime.label("movie_runtime"),
                Show.start_time.label("show_start_time"),  # Add start time
            )
            .join(Reservation, Reservation.id == Reservation_Seat.reservation_id)
            .join(Seat, Reservation_Seat.seat_id == Seat.id)
            .join(Hall_Row, Seat.row_id == Hall_Row.id)
            .join(Show, Show.id == Reservation.show_id)
            .join(Hall, Show.hall_id == Hall.id)
            .join(Movie, Show.movie_id == Movie.id)
            .where(Reservation_Seat.reservation_id.in_(reservation_ids))
        )
        seat_hall_movie_data = seat_hall_movie_query.all()

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
                    },
                    "show_start_time": row.show_start_time,  # Include start time
                }
            reservation_details[row.reservation_id]["seat_details"].append(
                {"seat_number": row.seat_number, "row_number": row.row_number}
            )

        # Combine reservations with their details
        result = []
        for reservation in reservations:
            details = reservation_details.get(reservation.id, {})
            result.append(
                {
                    "reservation": reservation,
                    "seat_details": details.get("seat_details", []),
                    "hall_name": details.get("hall_name"),
                    "movie_details": details.get("movie_details"),
                    # Include start time
                    "show_start_time": details.get("show_start_time"),
                }
            )

        return result
    except Exception as e:
        logger.exception(
            "Unexpected error occurred while retrieving reservations with details."
        )
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )


@router.get(
    "/get-details/{reservation_id}",
    response_description="Get a reservation by ID",
    summary="Get a reservation by ID",
    description="Retrieve a reservation by its ID from the database. Returns the reservation along with seat numbers, hall name, movie details, and show start time.",
)
async def get_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(user_required),  # Default to user_required
):
    """
    Retrieve a reservation by its ID from the database.
    - **Input**: Reservation ID.
    - **Returns**: The reservation object along with seat numbers, hall name, movie details, and show start time.
    - **Raises**: HTTP error if the reservation is not found or access is denied.
    """
    try:
        # Fetch reservation
        reservation_query = await db.execute(
            select(Reservation).where(Reservation.id == reservation_id)
        )
        reservation = reservation_query.scalars().first()

        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found.")

        # Check access permissions
        if reservation.user_id != current_user.id:
            # Allow access for admins or employees
            await employee_required(current_user)

        # Fetch seat details, hall name, movie details, and show start time in a single query
        seat_hall_movie_query = await db.execute(
            select(
                Seat.seat_number,
                Hall_Row.row_number,
                Hall.name.label("hall_name"),
                Movie.title.label("movie_title"),
                Movie.runtime.label("movie_runtime"),
                Movie.id.label("movie_id"),
                Show.start_time.label("show_start_time"),  # Add start time
            )
            .join(Reservation_Seat, Reservation_Seat.seat_id == Seat.id)
            .join(Hall_Row, Seat.row_id == Hall_Row.id)
            .join(Show, Show.id == reservation.show_id)
            .join(Hall, Show.hall_id == Hall.id)
            .join(Movie, Show.movie_id == Movie.id)
            .where(Reservation_Seat.reservation_id == reservation.id)
        )
        seat_hall_movie_data = seat_hall_movie_query.all()

        if not seat_hall_movie_data:
            raise HTTPException(
                status_code=404, detail="Seat, hall, or movie details not found."
            )

        # Extract seat details, hall name, movie details, and show start time
        seat_details = [
            {"seat_number": row.seat_number, "row_number": row.row_number}
            for row in seat_hall_movie_data
        ]
        hall_name = seat_hall_movie_data[0].hall_name
        movie_title = seat_hall_movie_data[0].movie_title
        movie_runtime = seat_hall_movie_data[0].movie_runtime
        show_start_time = seat_hall_movie_data[0].show_start_time
        movie_id = seat_hall_movie_data[0].movie_id

        return {
            "reservation": reservation,
            "seat_details": seat_details,
            "hall_name": hall_name,
            "movie_details": {
                "title": movie_title,
                "runtime": movie_runtime,
                "id": movie_id,
            },
            "show_start_time": show_start_time,  # Include start time
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions
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
    response_description="Get a user's reservation by ID",
    summary="Get a user's reservation by ID",
    description="Retrieve a user's reservation by its ID from the database. Returns the reservation along with seat numbers, hall name, movie details, show start time, and user name.",
)
async def get_user_reservation_details(
    userId: int,
    reservationId: int,
    db: AsyncSession = Depends(get_db_local),
    # Use global DB for user details
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
        # Fetch reservation
        reservation_query = await db.execute(
            select(Reservation).where(
                Reservation.id == reservationId, Reservation.user_id == userId
            )
        )
        reservation = reservation_query.scalars().first()

        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found.")

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

        # Fetch seat details, hall name, movie details, and show start time in a single query
        seat_hall_movie_query = await db.execute(
            select(
                Seat.seat_number,
                Hall_Row.row_number,
                Hall.name.label("hall_name"),
                Movie.title.label("movie_title"),
                Movie.runtime.label("movie_runtime"),
                Movie.id.label("movie_id"),
                Show.start_time.label("show_start_time"),
            )
            .join(Reservation_Seat, Reservation_Seat.seat_id == Seat.id)
            .join(Hall_Row, Seat.row_id == Hall_Row.id)
            .join(Show, Show.id == reservation.show_id)
            .join(Hall, Show.hall_id == Hall.id)
            .join(Movie, Show.movie_id == Movie.id)
            .where(Reservation_Seat.reservation_id == reservation.id)
        )
        seat_hall_movie_data = seat_hall_movie_query.all()

        if not seat_hall_movie_data:
            raise HTTPException(
                status_code=404, detail="Seat, hall, or movie details not found."
            )

        # Extract seat details, hall name, movie details, and show start time
        seat_details = [
            {"seat_number": row.seat_number, "row_number": row.row_number}
            for row in seat_hall_movie_data
        ]
        hall_name = seat_hall_movie_data[0].hall_name
        movie_title = seat_hall_movie_data[0].movie_title
        movie_runtime = seat_hall_movie_data[0].movie_runtime
        show_start_time = seat_hall_movie_data[0].show_start_time
        movie_id = seat_hall_movie_data[0].movie_id

        return {
            "reservation": reservation,
            "seat_details": seat_details,
            "hall_name": hall_name,
            "movie_details": {
                "title": movie_title,
                "runtime": movie_runtime,
                "id": movie_id,
            },
            "show_start_time": show_start_time,
            "user_details": {
                "first_name": user_details.first_name,
                "last_name": user_details.last_name,
                "username": user_details.username,
                "email": user_details.email,
            },
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions
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
        # Fetch the reservation
        reservation_query = await db.execute(
            select(Reservation).where(Reservation.id == reservation_id)
        )
        reservation = reservation_query.scalars().first()

        if not reservation:
            logger.warning(f"Reservation ID {reservation_id} not found.")
            raise HTTPException(status_code=404, detail="Reservation not found.")

        # Delete the reservation and associated reservation_seat entries
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
        # Re-raise HTTP exceptions
        logger.error(f"HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.exception("Unexpected error occurred while deleting the reservation.")
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}"
        )
