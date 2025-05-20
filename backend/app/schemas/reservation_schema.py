from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from .payment_schema import PaymentModel
from pydantic import BaseModel, Field


class ReservationBase(BaseModel):
    """
    Base model for a reservation, containing common fields shared across different representations of a reservation.
    """

    show_id: int = Field(
        ...,
        ge=1,
        title="Show ID",
        description="The unique identifier of the show for which the reservation is made. Must be a positive integer.",
    )
    status: str = Field(
        ...,
        title="Reservation Status",
        description="The current status of the reservation (e.g., pending, confirmed, canceled). This is a required field.",
    )
    created_at: datetime = Field(
        ...,
        title="Created At",
        description="The timestamp indicating when the reservation was created. This is a required field.",
    )


class ReservationModel(ReservationBase):
    """
    Pydantic model representing a reservation with an additional unique identifier.
    """

    id: int = Field(
        ...,
        ge=1,
        title="Reservation ID",
        description="A unique identifier for the reservation in the database. Must be a positive integer.",
    )
    user_id: int = Field(
        ...,
        ge=1,
        title="User ID",
        description="The unique identifier of the user making the reservation. Must be a positive integer.",
    )

    class Config:
        from_attributes = True
        """
        Configuration for the Pydantic model:
        - `from_attributes`: Allows population of the model from ORM objects.
        """


class SeatDetails(BaseModel):
    """
    Model representing details of a seat in a reservation.
    """

    seat_number: int = Field(
        ...,
        ge=1,
        title="Seat Number",
        description="The number of the seat in the hall. Must be a positive integer.",
    )
    row_number: int = Field(
        ...,
        ge=1,
        title="Row Number",
        description="The row number where the seat is located. Must be a positive integer.",
    )


class MovieDetails(BaseModel):
    """
    Model representing details of a movie associated with a reservation.
    """

    title: str = Field(
        ...,
        title="Movie Title",
        description="The title of the movie associated with the reservation.",
    )
    runtime: int = Field(
        ...,
        ge=1,
        title="Movie Runtime",
        description="The runtime of the movie in minutes. Must be a positive integer.",
    )
    id: int = Field(
        ...,
        ge=1,
        title="Movie ID",
        description="The unique identifier of the movie. Must be a positive integer.",
    )


class ReservationDetails(BaseModel):
    """
    Model representing detailed information about a reservation.
    """

    show_start_time: datetime = Field(
        ...,
        title="Show Start Time",
        description="The start time of the show associated with the reservation.",
    )
    show_price: float = Field(
        ...,
        ge=1,
        title="Show Price",
        description="The price of the show associated with the reservation. Must be a positive value.",
    )
    reservation: ReservationModel = Field(
        ...,
        title="Reservation",
        description="The reservation object containing basic reservation details.",
    )
    payment: Optional[PaymentModel] = Field(
        None,
        title="Payment",
        description="The payment object associated with the reservation. This field is optional.",
    )
    seat_details: List[SeatDetails] = Field(
        ...,
        title="Seat Details",
        description="A list of seat details associated with the reservation.",
    )
    hall_name: str = Field(
        ...,
        title="Hall Name",
        description="The name of the hall where the show is taking place.",
    )
    movie_details: MovieDetails = Field(
        ...,
        title="Movie Details",
        description="Details of the movie associated with the reservation.",
    )


class UserDetails(BaseModel):
    """
    Model representing details of a user.
    """

    first_name: str = Field(
        ...,
        title="First Name",
        description="The first name of the user.",
    )
    last_name: str = Field(
        ...,
        title="Last Name",
        description="The last name of the user.",
    )
    username: str = Field(
        ...,
        title="Username",
        description="The username of the user.",
    )
    email: str = Field(
        ...,
        title="Email",
        description="The email address of the user.",
    )


class UserReservationDetails(ReservationDetails):
    """
    Model representing detailed information about a reservation, including user details.
    """

    user_details: UserDetails = Field(
        ...,
        title="User Details",
        description="Details of the user associated with the reservation.",
    )
