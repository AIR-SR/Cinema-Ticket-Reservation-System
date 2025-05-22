from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.future import select  # Import select for SQLAlchemy 2.0
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete  # add this import
from datetime import datetime, timedelta
from models_local import Reservation, ReservationSeat
from .config import logger


async def delete_unpaid_reservations(db: AsyncSession):
    try:
        timeout = datetime.now(tz=None) - timedelta(minutes=15)
        stmt = select(Reservation).where(
            Reservation.status != "paid", Reservation.created_at < timeout
        )
        result = await db.execute(stmt)
        unpaid_reservations = result.scalars().all()
        count = len(unpaid_reservations)

        for reservation in unpaid_reservations:
            # Delete associated ReservationSeat entries
            await db.execute(
                delete(ReservationSeat).where(
                    ReservationSeat.reservation_id == reservation.id
                )
            )
            await db.delete(reservation)

        await db.commit()
        logger.info(
            f"[{datetime.now(tz=None)}] Deleted {count} unpaid reservations.")
    except Exception as e:
        logger.error(f"Error deleting unpaid reservations: {e}")
    finally:
        await db.close()  # Properly await the close method
