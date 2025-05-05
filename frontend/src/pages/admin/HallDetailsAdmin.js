import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import "../../styles/hall_view.css"; // Adjust the path as necessary

const HallDetailsAdmin = () => {
  const { hallId } = useParams();
  const [searchParams] = useSearchParams();
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

        const [hallResponse, rowsResponse, seatsResponse] = await Promise.all([
          api.get(`/halls/get/${hallId}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { region },
          }),
          api.get(`/halls/get/${hallId}/rows`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { region },
          }),
          api.get(`/seat/hall/${hallId}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { region },
          }),
        ]);

        const mapSeatsToRows = (rows, seats) =>
          rows.map((row) => ({
            ...row,
            seats: seats.filter((seat) => seat.row_id === row.id),
          }));

        const rowsWithSeats = mapSeatsToRows(
          rowsResponse.data,
          seatsResponse.data
        );

        setHall({ name: hallResponse.data.name, rows: rowsWithSeats });
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
      <div className="screen">Screen</div>
      <div className="hall-layout">
        {hall.rows.map((row) => (
          <div key={row.id} className="row-layout">
            <div className="row-number">{row.row_number}</div>
            <div className="seats-layout">
              {row.seats.map((seat) => (
                <div
                  key={seat.seat_number}
                  className={`seat-box ${
                    seat.is_reserved ? "reserved" : "available"
                  }`}
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
