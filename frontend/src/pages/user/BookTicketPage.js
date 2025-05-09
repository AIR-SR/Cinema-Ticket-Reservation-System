import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import HallView from "../../components/HallView";
import Loading from "../../components/Loading";
import Error from "../../components/Error";

const BookTicketPage = () => {
  const { movieId, showId } = useParams();
  const [searchParams] = useSearchParams();
  const region = searchParams.get("region");
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowAndSeats = async () => {
      setLoading(true);
      setError(null);
      try {
        const showResponse = await api.get(
          `/show/get-for-reservation/${showId}`,
          {
            params: { region },
          }
        );

        setShowDetails({
          movieTitle: showResponse.data.movie.title,
          showTime: showResponse.data.show.start_time,
          hallName: showResponse.data.hall.name,
        });

        const hallId = showResponse.data.hall.id;

        const { data: seatsData } = await api.get(`/seat/hall/${hallId}`, {
          params: { region },
        });

        let reservedSeats = [];
        try {
          const { data } = await api.get(`/show/get_reserved_seats/${showId}`, {
            params: { region },
          });
          reservedSeats = data;
        } catch (err) {
          if (err.response && err.response.status === 404) {
            reservedSeats = [];
          } else {
            throw err;
          }
        }

        const reservedSeatIds = Array.isArray(reservedSeats)
          ? reservedSeats
          : [];

        const updatedSeats = seatsData.map((seat) => ({
          ...seat,
          is_reserved: reservedSeatIds.includes(seat.id),
        }));

        const rowsWithSeats = updatedSeats.reduce((acc, seat) => {
          const row = acc.find((r) => r.row_id === seat.row_id);
          if (row) {
            row.seats.push(seat);
          } else {
            acc.push({ row_id: seat.row_id, seats: [seat] });
          }
          return acc;
        }, []);

        setSeats(rowsWithSeats);
      } catch (err) {
        console.error("Failed to fetch show or seats:", err);
        setError("Failed to load show or seats.");
      } finally {
        setLoading(false);
      }
    };

    fetchShowAndSeats();
  }, [showId, region]);

  const handleSeatSelection = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing.");

      const reservationData = {
        reservation: {
          show_id: parseInt(showId),
          status: "reserved",
          created_at: new Date().toISOString(),
        },
        seat_ids: selectedSeats,
      };

      await api.post(`/reservation/create`, reservationData, {
        params: { region },
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Booking successful!");
      navigate(`/users/reservations`);
    } catch (err) {
      console.error("Failed to book tickets:", err);
      setError("Failed to book tickets.");
    }
  };

  if (loading) return <Loading message="Fetching the reservation for you..." />;
  if (error)
    return <Error message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Book Tickets</h1>
      {showDetails && (
        <div className="show-details text-center mb-4">
          <h2>{showDetails.movieTitle}</h2>
          <p>
            <strong>Show Time:</strong>{" "}
            {new Date(showDetails.showTime).toLocaleString()}
          </p>
          <p>
            <strong>Hall:</strong> {showDetails.hallName}
          </p>
        </div>
      )}
      <HallView
        rows={seats}
        onSeatClick={handleSeatSelection}
        selectedSeats={selectedSeats}
      />
      <div className="d-flex justify-content-end mt-4">
        <button
          className="btn btn-primary"
          onClick={handleBooking}
          disabled={selectedSeats.length === 0}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default BookTicketPage;
