from core import admin_required, get_db_local, user_required
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models_global import UsersGlobal
from models_local import Reservation, Reservation_Seat
from pydantic import ValidationError
from schemas import ReservationSeatBase, ReservationSeatModel, ReservationBase, ReservationModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, text, select, func

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
    # Check if any of the seats are already reserved
    existing_reservations = await db.execute(
        select(Reservation_Seat).where(Reservation_Seat.seat_id.in_(seat_ids))
    )
    if existing_reservations.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="One or more seats are already reserved."
        )

    # Create the reservation
    new_reservation = Reservation(**reservation.model_dump())
    db.add(new_reservation)
    await db.flush()  # Flush to get the reservation ID

    # Create reservation_seat entries
    reservation_seats = [
        Reservation_Seat(seat_id=seat_id, reservation_id=new_reservation.id)
        for seat_id in seat_ids
    ]
    db.add_all(reservation_seats)
    await db.commit()

    return new_reservation


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
