from datetime import datetime

from core import admin_required, get_db_local, logger
from fastapi import APIRouter, Depends, HTTPException
from models_global import UsersGlobal
from models_local import Hall, Hall_Row, Seat
from pydantic import ValidationError
from schemas import HallBase, HallModel, HallRowsModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, text, select, func

router = APIRouter(prefix="/halls", tags=["Halls"])


@router.get(
    "/get",
    response_model=list[HallModel],
    response_description="Retrieve list of halls",
    summary="Fetch Halls",
    description="Fetch a list of halls stored in the database.",
)
async def get_halls(region: str, db: AsyncSession = Depends(get_db_local)):
    """
    Retrieve a list of halls stored in the database.

    - **Input**: Region name ('krakow', 'warsaw').
    - **Returns**: A list of halls with their IDs and names.
    - **Raises**: HTTP 404 error if no halls are found.
    """

    if region not in ["krakow", "warsaw"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid region: {region}. Supported regions are 'krakow' and 'warsaw'.",
        )

    query = select(Hall)
    result = await db.execute(query)
    halls = result.scalars().all()

    return halls


@router.post(
    "/add",
    response_model=HallModel,
    response_description="Add a new hall",
    summary="Add Hall",
    description="Adds a new hall to the database.",
)
async def add_hall(
    hall: HallBase,
    region: str,
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(admin_required),
):
    """
    Add a new hall to the database.

    - **Input**: Hall object containing the hall details.
    - **Validation**: Checks if the hall name already exists in the database.
    - **Returns**: The added hall object.
    - **Raises**: HTTP error if the hall name already exists.
    """
    existing_hall = await db.execute(select(Hall).where(Hall.name == hall.name))
    if existing_hall.scalars().first():
        raise HTTPException(status_code=400, detail="Hall name already exists")

    new_hall = Hall(**hall.model_dump())
    db.add(new_hall)
    await db.commit()
    await db.refresh(new_hall)

    return new_hall


@router.get(
    "/get/{hall_id}",
    response_model=HallModel,
    response_description="Retrieve hall details",
    summary="Fetch Hall Details",
    description="Fetch details of a specific hall by ID.",
)
async def get_hall(hall_id: int, region: str, db: AsyncSession = Depends(get_db_local)):
    """
    Retrieve details of a specific hall by ID.

    - **Input**: Hall ID.
    - **Returns**: Hall object with its details.
    - **Raises**: HTTP 404 error if the hall is not found.
    """
    query = select(Hall).where(Hall.id == hall_id)
    result = await db.execute(query)
    hall = result.scalars().first()

    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")

    return hall


@router.get(
    "/get/{hall_id}/rows",
    response_model=list[HallRowsModel],
    response_description="Retrieve hall rows",
    summary="Fetch Hall Rows",
    description="Fetch rows of a specific hall by ID.",
)
async def get_hall_rows(
    hall_id: int, region: str, db: AsyncSession = Depends(get_db_local)
):
    """
    Retrieve rows of a specific hall by ID.

    - **Input**: Hall ID.
    - **Returns**: List of rows in the hall.
    - **Raises**: HTTP 404 error if the hall is not found.
    """
    query = select(Hall_Row).where(Hall_Row.hall_id == hall_id)
    result = await db.execute(query)
    rows = result.scalars().all()

    if not rows:
        raise HTTPException(status_code=404, detail="Rows not found")

    return rows


@router.delete("/{hall_id}", status_code=204)
async def delete_hall(
    hall_id: int,
    region: str,
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(admin_required),
):
    if region not in ["krakow", "warsaw"]:
        raise HTTPException(status_code=400, detail="Invalid region.")

    hall = await db.get(Hall, hall_id)
    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found.")

    # Fetch rows associated with the hall
    rows_query = select(Hall_Row.id).where(Hall_Row.hall_id == hall_id)
    rows_result = await db.execute(rows_query)
    # No need to access `.id` since these are already integers
    row_ids = rows_result.scalars().all()

    # Delete seats associated with the rows
    await db.execute(delete(Seat).where(Seat.row_id.in_(row_ids)))

    # Delete rows associated with the hall
    await db.execute(delete(Hall_Row).where(Hall_Row.hall_id == hall_id))

    # Delete the hall itself
    await db.delete(hall)
    await db.commit()

    # Reset sequence if no halls remain
    result = await db.execute(select(func.count()).select_from(Hall))
    hall_count = result.scalar()

    if hall_count == 0:
        await db.execute(text("ALTER SEQUENCE halls_id_seq RESTART WITH 1"))
        await db.execute(text("ALTER SEQUENCE hall_rows_id_seq RESTART WITH 1"))
        await db.execute(text("ALTER SEQUENCE seats_id_seq RESTART WITH 1"))
        await db.commit()

    return {"detail": "Hall deleted successfully."}
