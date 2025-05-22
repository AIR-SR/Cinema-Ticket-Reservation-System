import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentPage = () => {
  const { reservationId } = useParams();
  const [searchParams] = useSearchParams();
  const region = searchParams.get("region");

  const [reservationData, setReservationData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("blik");
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false); // separate loading for payment
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "LFKG Cinemas | Payment";

    const fetchReservation = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(
          `/reservation/get-details/${reservationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { region },
          }
        );
        setReservationData(response.data);
      } catch (err) {
        console.error("Failed to fetch reservation:", err);
        setError("Unable to load reservation.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId, region]);

  const handlePayment = async () => {
    try {
      setPaymentLoading(true); // start payment loading
      const token = localStorage.getItem("token");

      const numberOfSeats = seat_details?.length || 0;
      const amount = numberOfSeats * show_price;

      const paymentData = {
        reservation_id: reservationId,
        amount,
        payment_method: selectedMethod,
        status: "completed",
        created_at: new Date().toISOString(),
      };

      await api.post(`/payment/create`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
        params: { region },
      });

      toast.success("Payment successful!");
      navigate(`/users/reservations`);
      setPaymentLoading(false); // stop payment loading
    } catch (err) {
      console.error("Payment creation failed:", err);
      setError("Payment failed. Please try again.");
      setPaymentLoading(false);
    } finally {
      setPaymentLoading(false); // stop payment loading in finally block
    }
  };
  const {
    reservation,
    movie_details,
    seat_details,
    hall_name,
    show_start_time,
    show_price,
  } = reservationData || {};

  if (loading)
    return <Loading message="Fetching the payment details for you..." />;
  if (paymentLoading) return <Loading message="Processing your payment..." />;
  if (error)
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Payment for Reservation</h2>

      {reservationData && (
        <div className="card p-4 mb-4 shadow-sm">
          <h5 className="mb-3">Reservation Details</h5>
          <p>
            <strong>Status:</strong> {reservation.status}
          </p>
          <p>
            <strong>Movie:</strong> {movie_details?.title}
          </p>
          <p>
            <strong>Runtime:</strong> {movie_details?.runtime} min
          </p>
          <p>
            <strong>Hall:</strong> {hall_name}
          </p>
          <p>
            <strong>Show Time:</strong>{" "}
            {new Date(show_start_time).toLocaleString()}
          </p>
          <p>
            <strong>Seats:</strong>{" "}
            {seat_details
              ?.map((seat) => `Row ${seat.row_number} Seat ${seat.seat_number}`)
              .join(", ")}
          </p>
        </div>
      )}

      {reservationData && (
        <div className="mb-4">
          <h4 className="mb-3">Amount to be Paid</h4>
          <p>
            <strong>Total:</strong>{" "}
            {(seat_details?.length * show_price).toFixed(2)} PLN
          </p>
        </div>
      )}

      <div className="mb-4">
        <h4 className="mb-3">Select Payment Method</h4>
        <div className="row">
          {[
            { id: "blik", label: "BLIK", image: "/assets/blik.png" },
            {
              id: "apple_pay",
              label: "Apple Pay",
              image: "/assets/applepay.png",
            },
            { id: "paypal", label: "PayPal", image: "/assets/paypal.png" },
          ].map((method) => (
            <div className="col-md-4 mb-3" key={method.id}>
              <div
                className={`card payment-option ${
                  selectedMethod === method.id ? "border-success" : ""
                }`}
                onClick={() => setSelectedMethod(method.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body text-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    id={method.id}
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                    style={{ display: "none" }}
                  />
                  <img
                    src={method.image}
                    alt={method.label}
                    style={{ maxHeight: "50px", marginBottom: "10px" }}
                  />
                  <h6>{method.label}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="d-flex justify-content-end mb-4">
        <button className="btn btn-success" onClick={handlePayment}>
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
