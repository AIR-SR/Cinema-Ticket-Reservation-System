from core import admin_required, get_db_local
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models_global import UsersGlobal
from models_local import Seat, Hall_Row
from pydantic import ValidationError
from schemas import SeatModel, SeatBase
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, text, select, func

router = APIRouter(prefix="/seat", tags=["Seat"])


@router.post("/add-seats",
             response_model=List[SeatModel],
             response_description="Add multiple seats",
             summary="Add multiple seats",
             description="Add multiple seats to the database. Returns the added seats.",
             )
async def add_multiple_seats(
    seats: List[SeatBase],
    region: str,
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(admin_required)
):
    """
    Add multiple seats to the database.
    - **Input**: A list of seat objects (each with row_number, seat_number, seat_type).
    - **Validation**: Ensures no duplicate seat_number exists for the given hall and row in the DB.
    - **Returns**: A list of newly added seat objects.
    - **Raises**: HTTP error if any seat already exists in the hall and row.
    """
    for seat in seats:
        existing = await db.execute(
            select(Seat).where(
                Seat.row_id == seat.row_id,
                Seat.seat_number == seat.seat_number
            )
        )
        if existing.scalars().first():
            raise HTTPException(
                status_code=400,
                detail=f"Seat {seat.seat_number} already exists in row {seat.row_id}"
            )
    new_seats = [Seat(**seat.model_dump()) for seat in seats]
    db.add_all(new_seats)
    await db.commit()
    result = await db.execute(select(func.count()).select_from(Seat))
    seat_count = result.scalar()
    if seat_count == 0:
        raise HTTPException(
            status_code=404,
            detail="No seats found"
        )
    return new_seats


@router.get("/hall/{hall_id}",
            response_model=List[SeatModel],
            response_description="Retrieve seats in a specific hall",
            summary="Fetch Seats in Hall",
            description="Fetch a list of seats in a specific hall, grouped by rows."
            )
async def get_seats_in_hall(hall_id: int, db: AsyncSession = Depends(get_db_local)):
    """
    Retrieve a list of seats in a specific hall, grouped by rows.

    - **Input**: Hall ID.
    - **Returns**: A list of seats with their IDs, row IDs, seat numbers, and types.
    - **Raises**: HTTP 404 error if no seats are found for the given hall.
    """
    query = select(Seat).join(Seat.hall_row).where(Hall_Row.hall_id == hall_id)
    result = await db.execute(query)
    seats = result.scalars().all()

    if not seats:
        raise HTTPException(
            status_code=404, detail=f"No seats found for hall ID {hall_id}")

    return seats
