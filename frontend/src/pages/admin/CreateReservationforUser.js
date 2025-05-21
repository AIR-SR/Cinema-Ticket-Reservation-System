import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import HallView from "../../components/HallView";
import RegionSelector from "../../components/RegionSelector";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateReservationForUser = () => {
  const { userId } = useParams();
  const [selectedRegion, setSelectedRegion] = useState("krakow");
  const [regions] = useState(["krakow", "warsaw"]);
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(userId || "");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "LFKG Cinemas | Create Reservation for User";
  }, []);

  useEffect(() => {
    // Fetch users for dropdown
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get("/users/get", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(data);
      } catch (err) {
        setError("Failed to load users.");
      }
    };
    fetchUsers();
  }, [selectedRegion]);

  // If userId from URL changes, update selectedUserId
  useEffect(() => {
    if (userId) setSelectedUserId(userId);
  }, [userId]);

  const fetchShows = async () => {
    if (!selectedRegion) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/show/movies_with_shows`, {
        params: { region: selectedRegion },
      });
      setShows(
        data.flatMap((movie) =>
          movie.shows.map((show) => ({
            ...show,
            movieTitle: movie.title,
          }))
        )
      );
    } catch (err) {
      console.error("Failed to fetch shows:", err);
      setError("Failed to load shows.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async (showId, hallId) => {
    setLoading(true);
    setError(null);
    try {
      const { data: rowsSeatsData } = await api.get(
        `/halls/get/${hallId}/rows_seats`,
        {
          params: { region: selectedRegion },
        }
      );

      let reservedSeats = [];
      try {
        const { data } = await api.get(`/show/get_reserved_seats/${showId}`, {
          params: { region: selectedRegion },
        });
        reservedSeats = data;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          reservedSeats = [];
        } else {
          throw err;
        }
      }

      const reservedSeatIds = Array.isArray(reservedSeats) ? reservedSeats : [];
      const updatedRowsSeats = rowsSeatsData.map((row) => ({
        ...row,
        seats: row.seats.map((seat) => ({
          ...seat,
          is_reserved: reservedSeatIds.includes(seat.id),
        })),
      }));

      setSeats(updatedRowsSeats);
    } catch (err) {
      console.error("Failed to fetch seats:", err);
      setError("Failed to load seats.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowSelection = (show) => {
    setSelectedShow(show);
    fetchSeats(show.id, show.hall_id); // Pass hallId from the selected show
  };

  const handleSeatSelection = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleReservation = async () => {
    if (!selectedShow || selectedSeats.length === 0 || !selectedUserId) {
      toast.warn("Please select a user, show and at least one seat.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing.");

      const reservationData = {
        reservation: {
          show_id: selectedShow.id,
          status: "reserved",
          created_at: new Date().toISOString(),
        },
        seat_ids: selectedSeats,
      };

      await api.post(
        `/reservation/create-for-user/${selectedUserId}`,
        reservationData,
        {
          params: { region: selectedRegion },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Reservation created successfully!");
      navigate(`/admin/reservations/list`);
    } catch (err) {
      console.error("Failed to create reservation:", err);
      setError("Failed to create reservation.");
    }
  };

  if (loading) return <Loading message="Loading details..." />;
  if (error)
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );

  return (
    <div className="container mt-5">
      {/* <ToastContainer /> */}
      <h1 className="text-center mb-4">Create Reservation for User</h1>
      {/* User selection dropdown */}
      <div className="mb-4">
        <label htmlFor="user" className="form-label">
          Select User:
        </label>
        <select
          id="user"
          className="form-select"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          disabled={!!userId}
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email || user.username || user.id}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <RegionSelector
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          regions={regions}
          labelInline={true}
          fullWidth={false}
        />
      </div>
      {selectedRegion && (
        <div className="mb-4">
          <button className="btn btn-primary" onClick={fetchShows}>
            Fetch Shows
          </button>
        </div>
      )}
      {shows.length > 0 && (
        <div className="mb-4">
          <label htmlFor="show" className="form-label">
            Select Show:
          </label>
          <select
            id="show"
            className="form-select"
            value={selectedShow?.id || ""}
            onChange={(e) =>
              handleShowSelection(
                shows.find((show) => show.id === parseInt(e.target.value))
              )
            }
          >
            <option value="">-- Select Show --</option>
            {shows.map((show) => (
              <option key={show.id} value={show.id}>
                {show.movieTitle} - {new Date(show.start_time).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedShow && (
        <div className="mb-4">
          <HallView
            rows={seats}
            onSeatClick={handleSeatSelection}
            selectedSeats={selectedSeats}
          />
        </div>
      )}
      <div className="d-flex justify-content-end">
        <button
          className="btn btn-success mb-4"
          onClick={handleReservation}
          disabled={
            !selectedShow || selectedSeats.length === 0 || !selectedUserId
          }
        >
          Confirm Reservation
        </button>
      </div>
    </div>
  );
};

export default CreateReservationForUser;
