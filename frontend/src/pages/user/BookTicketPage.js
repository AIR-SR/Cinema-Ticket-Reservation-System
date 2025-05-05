import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const BookTicketPage = () => {
  const { movieId, showId } = useParams();
  const [searchParams] = useSearchParams();
  const region = searchParams.get("region");
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(null); // New state for show details
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowAndSeats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch show details
        const showResponse = await api.get(`/show/get/${showId}`, {
          params: { region },
        });
        const hallId = showResponse.data.hall_id;
        const movieId = showResponse.data.movie_id;

        // Fetch movie details
        const movieResponse = await api.get(`/movies/get/${movieId}`, {
          params: { region },
        });

        setShowDetails({
          movieTitle: movieResponse.data.title, // Fetch movie title
          showTime: showResponse.data.start_time,
          hallName: showResponse.data.hall_name,
        });

        // Fetch seats using hallId
        const { data: seatsData } = await api.get(`/seat/hall/${hallId}`, {
          params: { region },
        });

        // Fetch reserved seats for the show
        let reservedSeats = [];
        try {
          const { data } = await api.get(`/show/get_reserved_seats/${showId}`, {
            params: { region },
          });
          reservedSeats = data;
        } catch (err) {
          if (err.response && err.response.status === 404) {
            reservedSeats = []; // Treat 404 as no reserved seats
          } else {
            throw err; // Re-throw other errors
          }
        }

        // Ensure reservedSeats is an array
        const reservedSeatIds = Array.isArray(reservedSeats)
          ? reservedSeats
          : [];

        // Mark reserved seats
        const updatedSeats = seatsData.map((seat) => ({
          ...seat,
          is_reserved: reservedSeatIds.includes(seat.id),
        }));

        setSeats(updatedSeats);
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
      navigate(`/movies/details/${movieId}?region=${region}`);
    } catch (err) {
      console.error("Failed to book tickets:", err);
      setError("Failed to book tickets.");
    }
  };

  if (loading) return <div className="text-center">Loading seats...</div>;
  if (error)
    return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Book Tickets</h1>
      {showDetails && ( // Display show details
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
      <div className="hall-layout">
        {seats.map((seat) => (
          <div
            key={seat.id}
            className={`seat-box ${
              seat.is_reserved
                ? "reserved" // Mark reserved seats with the "reserved" class
                : selectedSeats.includes(seat.id)
                ? "selected"
                : "available"
            }`}
            onClick={() => !seat.is_reserved && handleSeatSelection(seat.id)}
          >
            {seat.seat_number}
          </div>
        ))}
      </div>
      <button
        className="btn btn-primary mt-4"
        onClick={handleBooking}
        disabled={selectedSeats.length === 0}
      >
        Confirm Booking
      </button>
    </div>
  );
};

export default BookTicketPage;
