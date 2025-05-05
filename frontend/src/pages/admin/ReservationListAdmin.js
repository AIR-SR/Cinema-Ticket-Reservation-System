import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const ReservationListAdmin = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token)
          throw new Error("Authentication token is missing. Please log in.");

        const response = await api.get("/reservation/get-all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReservations(response.data);
      } catch (err) {
        setError(
          typeof err.response?.data?.detail === "string"
            ? err.response.data.detail
            : "Failed to fetch reservations."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) return <p>Loading reservations...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">All Reservations</h1>
      {reservations.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">User ID</th>
              <th scope="col">Show ID</th>
              <th scope="col">Status</th>
              <th scope="col">Created At</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>{reservation.id}</td>
                <td>{reservation.user_id}</td>
                <td>{reservation.show_id}</td>
                <td>{reservation.status}</td>
                <td>{new Date(reservation.created_at).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() =>
                      navigate(`/admin/reservations/${reservation.id}`)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No reservations found.</p>
      )}
    </div>
  );
};

export default ReservationListAdmin;
