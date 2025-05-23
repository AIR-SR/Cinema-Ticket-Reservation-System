import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import BackButton from "../../components/BackButton";

const ReservationsUserList = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "LFKG Cinemas | My Reservations"; // Set the document title
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        const regions = ["krakow", "warsaw"]; // List of regions
        const allReservations = [];

        for (const region of regions) {
          const response = await api.get("/reservation/my-reservations", {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in Authorization header
            },
            params: { region }, // Pass region as a parameter
          });

          const reservationsWithDetails = response.data.map(
            (reservationData) => {
              const {
                reservation,
                seat_details,
                hall_name,
                movie_details,
                show_start_time,
              } = reservationData;

              return {
                id: reservation.id,
                userId: reservation.user_id,
                createdAt: reservation.created_at,
                showId: reservation.show_id,
                status: reservation.status,
                seatDetails: seat_details,
                hallName: hall_name,
                movieTitle: movie_details.title,
                movieRuntime: movie_details.runtime,
                startTime: show_start_time, // Include show start time
                region,
              };
            }
          );

          allReservations.push(...reservationsWithDetails);
        }

        setReservations(allReservations);
      } catch (err) {
        console.error("Error fetching reservations:", err); // Log detailed error
        setError("Failed to fetch reservations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading) return <Loading message="Fetching your reservations..." />;
  if (error)
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">My Reservations</h1>
      {reservations.length === 0 ? (
        <div className="alert alert-info text-center">
          No reservations found.
        </div>
      ) : (
        <div className="row">
          {reservations.map((reservation) => (
            <div className="col-md-4 mb-3" key={reservation.id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{reservation.movieTitle}</h5>
                  <p className="card-text">
                    <strong>Hall:</strong> {reservation.hallName}
                  </p>
                  <p className="card-text">
                    <strong>Start Time:</strong>{" "}
                    {new Date(reservation.startTime).toLocaleString()}
                  </p>
                  <p className="card-text">
                    <strong>Status:</strong> {reservation.status}
                  </p>
                  <p className="card-text">
                    <strong>Region:</strong> {reservation.region}
                  </p>
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() =>
                      navigate(
                        `/users/reservations/${reservation.id}?region=${reservation.region}`
                      )
                    }
                  >
                    View Details
                  </button>
                  {/* Add Go to Payment button if not paid */}
                  {reservation.status !== "paid" && (
                    <button
                      className="btn btn-success mt-2 ms-2"
                      onClick={() =>
                        navigate(
                          `/payment/${reservation.id}?region=${reservation.region}`
                        )
                      }
                    >
                      Go to Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="d-flex justify-content-start mt-4 mb-4">
        <BackButton />
      </div>
    </div>
  );
};

export default ReservationsUserList;
