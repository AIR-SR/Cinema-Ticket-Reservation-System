from core import (
    admin_required,
    employee_required,
    get_db_local,
    get_db_global,
    user_required,
    logger,
)
from fastapi import APIRouter, Depends, HTTPException
from models_global import UsersGlobal
from models_local import Reservation, Payment
from schemas import PaymentModel, ReservationDetails, PaymentBase
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from sqlalchemy.orm import selectinload


router = APIRouter(prefix="/payment", tags=["Payments"])


@router.get(
    "/get-all",
    response_model=list[PaymentModel],
    response_description="Get all payments",
    summary="Get all payments",
    description="Get all payments in the database.",
)
async def get_all_payments(
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(admin_required),
):
    result = await db.execute(select(Payment))
    return result.scalars().all()


@router.post(
    "/create",
    response_model=PaymentModel,
    response_description="Create a payment",
    summary="Create a payment",
    description="Create a payment in the database. Returns the created reservation.",
)
async def create_payment(
    payment: PaymentBase,
    db: AsyncSession = Depends(get_db_local),
    current_user: UsersGlobal = Depends(user_required),
):
    result = await db.execute(
        select(Reservation)
        .options(selectinload(Reservation.show))
        .where(Reservation.id == payment.reservation_id)
    )
    reservation = result.scalars().first()

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found.")

    if reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="You do not own this reservation."
        )
    if not reservation.show or reservation.show.price is None:
        raise HTTPException(
            status_code=400, detail="No price available for this reservation's show."
        )

    amount = reservation.show.price

    existing = await db.execute(
        select(Payment).where(Payment.reservation_id == payment.reservation_id)
    )
    if existing.scalar():
        raise HTTPException(
            status_code=400, detail="Payment already exists for this reservation."
        )

    payment.created_at = payment.created_at.replace(tzinfo=None)

    new_payment = Payment(**payment.model_dump())

    db.add(new_payment)

    reservation.status = "paid"
    db.add(reservation)

    await db.commit()
    await db.refresh(new_payment)

    return PaymentModel.from_orm(new_payment)
