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

        setHall({
          name: hallResponse.data.name,
          rows: rowsResponse.data,
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
      <div className="row justify-content-center">
        {hall.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="col-12 mb-3">
            <div className="d-flex align-items-center mb-2">
              <span className="fw-bold me-2">Row {row.row_number}:</span>
              <span>{row.seat_count} seats</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HallDetailsAdmin;
