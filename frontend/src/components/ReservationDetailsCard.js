import React from "react";
import { useNavigate } from "react-router-dom";

const ReservationDetailsCard = ({ reservationDetails, region }) => {
  const navigate = useNavigate();

  const {
    reservation,
    seat_details,
    hall_name,
    movie_details,
    show_start_time,
    payment, // Added payment details
  } = reservationDetails;

  return (
    <div>
      {/* Movie Information */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title text-secondary">Movie Information</h5>
          <hr />
          <p className="card-text">
            <strong>Title:</strong> {movie_details.title}
          </p>
          <p className="card-text">
            <strong>Runtime:</strong> {movie_details.runtime} minutes
          </p>
          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(`/movies/details/${movie_details.id}?region=${region}`)
            }
          >
            View Movie Details
          </button>
        </div>
      </div>

      {/* Reservation Information */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title text-secondary">Reservation Information</h5>
          <hr />
          <p className="card-text">
            <strong>Status:</strong> {reservation.status}
          </p>
          <p className="card-text">
            <strong>Created At:</strong>{" "}
            {new Date(reservation.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payment Information */}
      {payment ? (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title text-secondary">Payment Information</h5>
            <hr />
            <p className="card-text">
              <strong>Amount:</strong> {payment.amount.toFixed(2)} PLN
            </p>
            <p className="card-text">
              <strong>Payment Method:</strong> {payment.payment_method}
            </p>
            <p className="card-text">
              <strong>Status:</strong> {payment.status}
            </p>
            <p className="card-text">
              <strong>Created At:</strong>{" "}
              {new Date(payment.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title text-secondary">Payment Information</h5>
            <hr />
            <p className="card-text text-muted">
              This reservation has not been paid yet.
            </p>
          </div>
        </div>
      )}

      {/* Combined Hall, Show, and Seat Details */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title text-secondary">Show Details</h5>
          <hr />
          <p className="card-text">
            <strong>Hall Name:</strong> {hall_name}
          </p>
          <p className="card-text">
            <strong>Start Time:</strong>{" "}
            {new Date(show_start_time).toLocaleString()}
          </p>
          <h6 className="mt-3">Seat Details:</h6>
          <ul className="list-group">
            {seat_details.map((seat, index) => (
              <li key={index} className="list-group-item">
                <strong>Row:</strong> {seat.row_number}, <strong>Seat:</strong>{" "}
                {seat.seat_number}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsCard;
