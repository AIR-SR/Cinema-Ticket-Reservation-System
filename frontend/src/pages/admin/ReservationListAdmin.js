import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import RegionSelector from "../../components/RegionSelector";
import BackButton from "../../components/BackButton";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";

const ReservationListAdmin = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("krakow");
  const [regions] = useState(["krakow", "warsaw"]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [users, setUsers] = useState([]); // <-- add users state
  const navigate = useNavigate();

  useEffect(() => {
    setReservations([]);
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token)
          throw new Error("Authentication token is missing. Please log in.");

        // Fetch users
        const usersResponse = await api.get("/users/get", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersResponse.data);

        // Fetch reservations
        const response = await api.get("/reservation/get-all", {
          headers: { Authorization: `Bearer ${token}` },
          params: { region: selectedRegion },
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
  }, [selectedRegion]);

  // Helper to get user email by user_id
  const getUserEmail = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.email : userId;
  };

  const handleDelete = async () => {
    if (!reservationToDelete) return;
    try {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Authentication token is missing. Please log in.");

      await api.delete(`/reservation/delete/${reservationToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { region: selectedRegion },
      });

      setReservations((prev) =>
        prev.filter((res) => res.id !== reservationToDelete.id)
      );
      toast.success("Reservation deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error(
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "Failed to delete reservation."
      );
    } finally {
      setShowDeleteModal(false);
      setReservationToDelete(null);
    }
  };

  if (error)
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
        <ErrorMessage
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );

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
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin/reservations/create")}
        >
          Create Reservation
        </button>
      </div>
      {loading ? (
        <Loading message="Loading reservations..." />
      ) : reservations.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">User Email</th>
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
                <td>{getUserEmail(reservation.user_id)}</td>
                <td>{reservation.show_id}</td>
                <td>{reservation.status}</td>
                <td>{new Date(reservation.created_at).toLocaleString()}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() =>
                      navigate(
                        `/admin/reservations/user/${reservation.user_id}/details/${reservation.id}?region=${selectedRegion}`
                      )
                    }
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setReservationToDelete(reservation);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && (
          <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
            <div className="mb-3">
              <i
                className="bi bi-calendar-x"
                style={{ fontSize: "3rem", color: "#6c757d" }}
              ></i>
            </div>
            <p className="mb-3 fs-5 text-muted">
              No reservations found for the selected region.
            </p>
          </div>
        )
      )}
      <div className="d-flex justify-content-start mt-4">
        <BackButton />
      </div>
      {showDeleteModal && (
        <Modal
          title="Confirm Delete"
          onClose={() => {
            setShowDeleteModal(false);
            setReservationToDelete(null);
          }}
          onSave={handleDelete}
          saveText="Delete"
          cancelText="Cancel"
          saveButtonType="danger"
        >
          Are you sure you want to delete this reservation?
        </Modal>
      )}
    </div>
  );
};

export default ReservationListAdmin;
