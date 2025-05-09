import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import RegionSelector from "../../components/RegionSelector";
import BackButton from "../../components/BackButton";

const ReservationListAdmin = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("krakow"); // Default region
  const [regions] = useState(["krakow", "warsaw"]); // List of regions
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token)
          throw new Error("Authentication token is missing. Please log in.");

        const response = await api.get("/reservation/get-all", {
          headers: { Authorization: `Bearer ${token}` },
          params: { region: selectedRegion }, // Pass selected region as a parameter
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
  }, [selectedRegion]); // Re-fetch reservations when selectedRegion changes

  if (loading) return <p>Loading reservations...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">All Reservations</h1>
      <div className="d-flex align-items-center justify-content-between mb-3 gap-2">
        <RegionSelector
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          regions={regions}
          labelInline={true} // Inline label
          fullWidth={false} // Not full width
        />
      </div>
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
      <div className="d-flex justify-content-start mt-4">
        <BackButton />
      </div>
    </div>
  );
};

export default ReservationListAdmin;
