from datetime import datetime

from pydantic import BaseModel, Field


class PaymentBase(BaseModel):
    """
    Base model for a payment, containing common fields shared across different representations of a payment.
    """

    reservation_id: int = Field(
        ...,
        ge=1,
        title="Reservation ID",
        description="The unique identifier of the associated reservation. Must be a positive integer.",
    )
    amount: float = Field(
        ...,
        ge=1,
        title="Payment Amount",
        description="The total amount paid for the reservation. Must be a positive value.",
    )
    payment_method: str = Field(
        ...,
        title="Payment Method",
        description="The method used for payment (e.g., card, cash). This is a required field.",
    )
    status: str = Field(
        ...,
        title="Payment Status",
        description="The current status of the payment (e.g., pending, completed). This is a required field.",
    )
    created_at: datetime = Field(
        ...,
        title="Created At",
        description="The timestamp indicating when the payment was created. This is a required field.",
    )


class PaymentModel(PaymentBase):
    """
    Pydantic model representing a payment with an additional unique identifier.
    """

    id: int = Field(
        ...,
        ge=1,
        title="Payment ID",
        description="A unique identifier for the payment in the database. Must be a positive integer.",
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """
