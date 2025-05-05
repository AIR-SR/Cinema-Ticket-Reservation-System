from core import admin_required, get_db_local, user_required, logger
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models_global import UsersGlobal
from models_local import Reservation, Reservation_Seat
from pydantic import ValidationError
from schemas import ReservationSeatBase, ReservationSeatModel, ReservationBase, ReservationModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, text, select, func
from datetime import datetime

router = APIRouter(prefix="/reservation", tags=["Reservation"])


@router.post("/create",
             response_model=ReservationModel,
             response_description="Create a reservation",
             summary="Create a reservation",
             description="Create a reservation in the database. Returns the created reservation.",
             )
async def create_reservation(
    reservation: ReservationBase,
    seat_ids: List[int],  # Add a list of seat IDs to reserve
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(user_required)
):
    """
    Create a reservation in the database.
    - **Input**: A reservation object and a list of seat IDs to reserve.
    - **Validation**: Ensures no duplicate reservation exists for the given seats in the DB.
    - **Returns**: The newly created reservation object.
    - **Raises**: HTTP error if any seat is already reserved.
    """
    logger.info(
        f"Creating reservation for user {current_user.id} with data: {reservation} and seat IDs: {seat_ids}")
    try:
        # Convert created_at to offset-naive datetime
        if isinstance(reservation.created_at, datetime) and reservation.created_at.tzinfo is not None:
            reservation.created_at = reservation.created_at.replace(
                tzinfo=None)

        # Check if any of the seats are already reserved
        existing_reservations = await db.execute(
            select(Reservation_Seat).where(
                Reservation_Seat.seat_id.in_(seat_ids))
        )
        if existing_reservations.scalars().first():
            logger.warning(
                f"Reservation failed: One or more seats are already reserved. Seat IDs: {seat_ids}")
            raise HTTPException(
                status_code=400,
                detail="One or more seats are already reserved."
            )

        # Create the reservation
        new_reservation = Reservation(
            user_id=current_user.id,
            show_id=reservation.show_id,
            status=reservation.status,
            created_at=reservation.created_at
        )
        db.add(new_reservation)
        await db.flush()  # Flush to get the reservation ID

        # Create reservation_seat entries
        reservation_seats = [
            Reservation_Seat(
                seat_id=seat_id, reservation_id=new_reservation.id)
            for seat_id in seat_ids
        ]
        db.add_all(reservation_seats)
        await db.commit()

        logger.info(
            f"Reservation created successfully with ID: {new_reservation.id}")
        return new_reservation
    except ValidationError as e:
        logger.error(f"Validation error while creating reservation: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException as e:
        # Re-raise HTTP exceptions to avoid overwriting
        logger.error(f"HTTP exception: {e.detail}")
        raise e
    except Exception as e:
        logger.exception(
            "Unexpected error occurred while creating the reservation.")
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.get("/get-all",
            response_model=List[ReservationModel],
            response_description="Get all reservations",
            summary="Get all reservations",
            description="Retrieve all reservations from the database. Returns a list of reservations.",
            )
async def get_reservations(
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(admin_required)
):
    """
    Retrieve all reservations from the database.
    - **Returns**: A list of reservation objects.
    """
    result = await db.execute(select(Reservation))
    return result.scalars().all()
