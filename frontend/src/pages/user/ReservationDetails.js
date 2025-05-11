import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import Loading from "../../components/Loading";
import Error from "../../components/Error";
import BackButton from "../../components/BackButton"; // Import the BackButton component

const ReservationDetails = () => {
  const { reservationId } = useParams();
  const [searchParams] = useSearchParams();
  const region = searchParams.get("region");
  const [reservationDetails, setReservationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservationDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token is missing.");

        const response = await api.get(
          `/reservation/get-details/${reservationId}`,
          {
            params: { region },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setReservationDetails(response.data);
      } catch (err) {
        console.error("Failed to fetch reservation details:", err);
        setError("Failed to load reservation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [reservationId, region]);

  if (loading) return <Loading message="Loading reservation details..." />;
  if (error)
    return <Error message={error} onRetry={() => window.location.reload()} />;

  const {
    reservation,
    seat_details,
    hall_name,
    movie_details,
    show_start_time,
  } = reservationDetails;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 text-primary">Reservation Details</h1>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          {/* Reservation Information */}
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

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          {/* Movie Information */}
          <h5 className="card-title text-secondary">Movie Information</h5>
          <hr />
          <p className="card-text">
            <strong>Title:</strong> {movie_details.title}
          </p>
          <p className="card-text">
            <strong>Runtime:</strong> {movie_details.runtime} minutes
          </p>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          {/* Hall Information */}
          <h5 className="card-title text-secondary">Hall Information</h5>
          <hr />
          <p className="card-text">
            <strong>Hall Name:</strong> {hall_name}
          </p>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          {/* Show Information */}
          <h5 className="card-title text-secondary">Show Information</h5>
          <hr />
          <p className="card-text">
            <strong>Start Time:</strong>{" "}
            {new Date(show_start_time).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          {/* Seat Details */}
          <h5 className="card-title text-secondary">Seat Details</h5>
          <hr />
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

      <div className="d-flex justify-content-start mt-4 mb-4">
        <BackButton />
      </div>
    </div>
  );
};

export default ReservationDetails;
