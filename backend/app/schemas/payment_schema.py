from datetime import datetime

from pydantic import BaseModel, Field


class PaymentBase(BaseModel):
    """
    Base model for a payment, containing common fields.
    """
    reservation_id: int = Field(..., ge=1, title="Reservation ID", description="ID of the associated reservation.")
    amount: float = Field(..., ge=1, title="Payment Amount", description="Amount paid for the reservation.")
    payment_method: str = Field(..., title="Payment Method", description="Method used for payment (e.g., card, cash).")
    status: str = Field(..., title="Payment Status", description="Current status of the payment (e.g., pending, completed).")
    created_at: datetime = Field(..., title="Created At", description="Timestamp when the payment was created.")

class PaymentModel(PaymentBase):
    """
    Pydantic model representing a payment with an ID.
    """
    id: int = Field(..., ge=1, title="Payment ID", description="Unique identifier for the payment in the database.")

    class Config:
        from_attributes = True