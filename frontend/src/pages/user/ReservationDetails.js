import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import BackButton from "../../components/BackButton";
import ReservationDetailsCard from "../../components/ReservationDetailsCard"; // Import the new component

const ReservationDetails = () => {
  const { reservationId } = useParams();
  const [searchParams] = useSearchParams();
  const region = searchParams.get("region");
  const [reservationDetails, setReservationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "LFKG Cinemas | Reservation Details";
    const fetchReservationDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token is missing.");

        const response = await api.get(
          `/reservation/get-details/${reservationId}`,
          {
            params: { region },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setReservationDetails(response.data);
      } catch (err) {
        console.error("Failed to fetch reservation details:", err);
        setError("Failed to load reservation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [reservationId, region]);

  if (loading) return <Loading message="Loading reservation details..." />;
  if (error)
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 text-primary">Reservation Details</h1>
      <ReservationDetailsCard
        reservationDetails={reservationDetails}
        region={region}
      />
      <div className="d-flex justify-content-start mt-4 mb-4">
        <BackButton />
      </div>
    </div>
  );
};

export default ReservationDetails;
