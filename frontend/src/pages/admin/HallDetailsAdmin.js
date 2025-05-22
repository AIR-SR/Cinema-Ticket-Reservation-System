import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import BackButton from "../../components/BackButton";
import HallView from "../../components/HallView";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
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

        const [hallResponse, rowsSeatsResponse] = await Promise.all([
          api.get(`/halls/get/${hallId}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { region },
          }),
          api.get(`/halls/get/${hallId}/rows_seats`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { region },
          }),
        ]);

        setHall({ name: hallResponse.data.name, rows: rowsSeatsResponse.data });
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch hall details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHallDetails();
  }, [hallId, region]);

  if (loading) return <Loading message="Loading hall details..." />;
  if (error)
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">{hall.name}</h1>
      <HallView rows={hall.rows} />
      <BackButton />
    </div>
  );
};

export default HallDetailsAdmin;
