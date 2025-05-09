import React, { useEffect, useState } from "react";
import api from "../../utils/api"; // Use the configured API instance
import Loading from "../../components/Loading";
import Error from "../../components/Error";

const ReservationsUserList = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

          const reservationsWithDetails = await Promise.all(
            response.data.map(async (reservation) => {
              // Fetch show details
              const showResponse = await api.get(
                `/show/get/${reservation.show_id}`,
                {
                  params: { region },
                }
              );

              const { movie_id, hall_id, start_time } = showResponse.data;

              // Fetch hall details
              const hallResponse = await api.get(`/halls/get/${hall_id}`, {
                params: { region },
              });

              // Fetch movie details
              const movieResponse = await api.get(`/movies/get/${movie_id}`, {
                params: { region },
              });

              return {
                ...reservation,
                region,
                movieTitle: movieResponse.data.title,
                hallName: hallResponse.data.name,
                startTime: start_time,
              };
            })
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
    return <Error message={error} onRetry={() => window.location.reload()} />;

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
            <div className="col-md-4 mb-4" key={reservation.id}>
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
                  <p className="card-text">
                    <strong>Created At:</strong>{" "}
                    {new Date(reservation.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsUserList;
