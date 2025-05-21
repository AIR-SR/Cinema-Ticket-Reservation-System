from celery import Celery
from sqlalchemy.future import select, delete
from models_local import Reservation, ReservationSeats
import asyncio
from database import sessions
from datetime import datetime, timedelta

celery = Celery("Cinema-Ticket-Reservation-System",
                broker="redis://localhost",
                backend="redis://localhost",)


celery.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
)

@celery.task(name="delete_unpaid_reservation")
def delete_unpaid_reservation(reservation_id: int, region: str):
    asyncio.run(_delete_unpaid_reservation(reservation_id, region))

async def _delete_unpaid_reservation(reservation_id: int, region: str):
    async with sessions[region]() as db:
        result = await db.execute(
            select(Reservation).where(Reservation.id == reservation_id)
        )
        reservation = result.scalar_one_or_none()

        if reservation and reservation.status == "pending":
            print("START REZERWACJI")
            created_plus_15 = reservation.created_at + timedelta(minutes=15)
            if datetime.utcnow() >= created_plus_15:
                print("MINELO 15 minut wywal z bazy")
                await db.execute(
                    delete(ReservationSeats).where(ReservationSeats.reservation_id == reservation_id)
                )
                await db.execute(
                    delete(Reservation).where(Reservation.id == reservation_id)
                )
                await db.commit()