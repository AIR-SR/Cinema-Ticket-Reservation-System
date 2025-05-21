import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import HallView from "../../components/HallView";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BookTicketPage = () => {
  const { showId } = useParams();
  const [searchParams] = useSearchParams();
  const region = searchParams.get("region");
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "LFKG Cinemas | Book Tickets";
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
          showPrice: showResponse.data.show.price,
        });

        const hallId = showResponse.data.hall.id;

        const { data: rowsSeatsData } = await api.get(
          `/halls/get/${hallId}/rows_seats`,
          {
            params: { region },
          }
        );

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

        const updatedRowsSeats = rowsSeatsData.map((row) => ({
          ...row,
          seats: row.seats.map((seat) => ({
            ...seat,
            is_reserved: reservedSeatIds.includes(seat.id),
          })),
        }));

        setSeats(updatedRowsSeats);
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
      toast.warn("Please select at least one seat.");
      return;
    }

    setBookingLoading(true);
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

      const response = await api.post(`/reservation/create`, reservationData, {
        params: { region },
        headers: { Authorization: `Bearer ${token}` },
      });

      const reservationId = response.data?.id;
      if (!reservationId) throw new Error("Reservation ID not returned.");

      console.log(
        "Redirecting to payment page:",
        `/payment/${reservationId}?region=${region}`
      );
      toast.success("Booking successful! Redirecting to payment page...");
      navigate(`/payment/${reservationId}?region=${region}`);
      setBookingLoading(false);
    } catch (err) {
      setBookingLoading(false);
      console.error("Failed to book tickets:", err);
      setError("Failed to book tickets.");
    }
  };

  if (loading || bookingLoading)
    return (
      <Loading
        message={
          bookingLoading
            ? "Booking your tickets..."
            : "Fetching the reservation for you..."
        }
      />
    );
  if (error)
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );

  return (
    <div className="container mt-3">
      {/* <ToastContainer /> */}
      <h1 className="text-center mb-3">Book Tickets</h1>
      {showDetails && (
        <div className="show-details text-center mb-3">
          <h2>{showDetails.movieTitle}</h2>
          <p>
            <strong>Show Time:</strong>{" "}
            {new Date(showDetails.showTime).toLocaleString()}
          </p>
          <p>
            <strong>Hall:</strong> {showDetails.hallName}
          </p>
          <p>
            <strong>Price:</strong> {showDetails.showPrice} PLN
          </p>
        </div>
      )}
      <HallView
        rows={seats}
        onSeatClick={handleSeatSelection}
        selectedSeats={selectedSeats}
      />
      <div className="d-flex justify-content-end mt-3 mb-3">
        <button
          type="button"
          className="btn btn-success"
          onClick={handleBooking}
          disabled={selectedSeats.length === 0 || loading || bookingLoading}
        >
          {bookingLoading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
};

export default BookTicketPage;
