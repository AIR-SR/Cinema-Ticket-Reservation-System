import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom"; // Import useSearchParams for query parameters
import api from "../../utils/api";

const HallDetailsAdmin = () => {
  const { hallId } = useParams();
  const [searchParams] = useSearchParams(); // Get query parameters
  const region = searchParams.get("region");
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHallDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token)
          throw new Error("Authentication token is missing. Please log in.");

        const hallResponse = await api.get(`/halls/get/${hallId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { region },
        });

        const rowsResponse = await api.get(`/halls/get/${hallId}/rows`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { region },
        });

        const seatsResponse = await api.get(`/seat/hall/${hallId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { region },
        });

        const rowsWithSeats = rowsResponse.data.map((row) => ({
          ...row,
          seats: seatsResponse.data.filter((seat) => seat.row_id === row.id),
        }));

        setHall({
          name: hallResponse.data.name,
          rows: rowsWithSeats,
        });
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch hall details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHallDetails();
  }, [hallId, region]);

  if (loading)
    return <p className="text-center mt-4">Loading hall details...</p>;
  if (error) return <p className="text-danger text-center mt-4">{error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">{hall.name}</h1>
      <div
        className="screen"
        style={{
          width: "100%",
          height: "40px",
          backgroundColor: "#333",
          color: "#fff",
          textAlign: "center",
          lineHeight: "40px",
          borderRadius: "6px",
          marginBottom: "20px", // Increased spacing below the screen
        }}
      >
        Screen
      </div>
      <div
        className="hall-layout"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px", // Increased spacing between rows
        }}
      >
        {hall.rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="row-layout"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px", // Increased spacing between row number and seats
            }}
          >
            <div
              className="row-number"
              style={{
                width: "30px",
                textAlign: "center",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              {row.row_number}
            </div>
            <div
              className="seats-layout"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "8px", // Increased spacing between seats
              }}
            >
              {row.seats.map((seat) => (
                <div
                  key={seat.seat_number}
                  className="seat-box"
                  style={{
                    width: "30px",
                    height: "30px",
                    backgroundColor: seat.is_reserved ? "#f00" : "#4caf50",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {seat.seat_number}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HallDetailsAdmin;
