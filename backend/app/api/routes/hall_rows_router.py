from typing import List

from core import admin_required, get_db_local
from fastapi import APIRouter, Depends, HTTPException
from models_global import UsersGlobal
from models_local import HallRow
from schemas import HallRowsBase, HallRowsModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

router = APIRouter(prefix="/hall_rows", tags=["Hall Rows"])


@router.post(
    "/add-rows",
    response_model=List[HallRowsModel],
    response_description="Add multiple hall rows",
    summary="Add Multiple Hall Rows",
    description="Adds multiple rows to a hall, each with custom seat counts.",
)
async def add_multiple_hall_rows(
    rows: List[HallRowsBase],
    region: str,
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(admin_required),
):
    """
    Add multiple rows to a hall in the database.

    - Input: A list of row objects (each with hall_id, row_number, seat_count).
    - Validation: Ensures no duplicate row_number exists for the given hall in the DB.
    - Returns: A list of newly added row objects.
    - Raises: HTTP error if any row already exists in the hall.
    """
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail="Invalid region.")

    for row in rows:
        existing = await db.execute(
            select(HallRow).where(
                HallRow.hall_id == row.hall_id, HallRow.row_number == row.row_number
            )
        )
        if existing.scalars().first():
            raise HTTPException(
                status_code=400,
                detail=f"Row {row.row_number} already exists in hall {row.hall_id}",
            )

    new_rows = [HallRow(**row.model_dump()) for row in rows]
    db.add_all(new_rows)
    await db.commit()

    for r in new_rows:
        await db.refresh(r)

    return new_rows


@router.get(
    "/rows",
    response_model=List[HallRowsModel],
    response_description="Retrieve all hall rows",
    summary="Fetch All Hall Rows",
    description="Fetch a list of all hall rows. You can optionally filter by hall ID.",
)
async def get_all_rows(
    region: str, hall_id: int = None, db: AsyncSession = Depends(get_db_local)
):
    """
    Retrieve a list of all hall rows.

    - Input: Optional hall_id to filter rows for a specific hall.
    - Returns: A list of hall row objects.
    - Raises: HTTP 404 if no rows are found.
    """
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail="Invalid region.")

    query = select(HallRow)
    if hall_id:
        query = query.where(HallRow.hall_id == hall_id)

    result = await db.execute(query)
    rows = result.scalars().all()

    if not rows:
        raise HTTPException(status_code=404, detail="No rows found.")

    return rows


@router.get(
    "/rows/{hall_id}",
    response_model=List[HallRowsModel],
    response_description="Retrieve rows for a specific hall",
    summary="Fetch Rows by Hall ID",
    description="Fetch all rows belonging to a specific hall by its ID.",
)
async def get_rows_by_hall(
    hall_id: int, region: str, db: AsyncSession = Depends(get_db_local)
):
    """
    Retrieve all rows for a specific hall.

    - Input: Hall ID.
    - Returns: List of row objects for the given hall.
    - Raises: HTTP 404 if no rows found for the hall.
    """
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail="Invalid region.")

    query = select(HallRow).where(HallRow.hall_id == hall_id)
    result = await db.execute(query)
    rows = result.scalars().all()

    if not rows:
        raise HTTPException(status_code=404, detail="No rows found for this hall.")

    return rows
