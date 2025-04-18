import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const HallListAdmin = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("krakow");
  const [regions] = useState(["krakow", "warsaw"]);

  const navigate = useNavigate();

  const fetchHalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/halls/get`, {
        params: { region: selectedRegion },
      });

      const hallsWithSeats = await Promise.all(
        response.data.map(async (hall) => {
          try {
            const rowsRes = await api.get(`/hall_rows/rows/${hall.id}`, {
              params: { region: selectedRegion },
            });
            const totalSeats = rowsRes.data.reduce(
              (sum, row) => sum + row.seat_count,
              0
            );
            return { ...hall, totalSeats };
          } catch {
            return { ...hall, totalSeats: 0 };
          }
        })
      );

      setHalls(hallsWithSeats);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`No halls found for the region '${selectedRegion}'.`);
      } else {
        setError("Failed to fetch halls.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage.");
      alert("You must be logged in as admin to delete a hall.");
      return;
    }

    try {
      await api.delete(`/halls/${id}`, {
        params: { region: selectedRegion },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh list after deletion
      setHalls((prev) => prev.filter((hall) => hall.id !== id));
    } catch (err) {
      console.error("Failed to delete hall:", err);
      alert(
        "Failed to delete hall: " + (err.response?.data?.detail || err.message)
      );
    }
  };

  useEffect(() => {
    fetchHalls();
  }, [selectedRegion]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Hall List by Region</h1>
      <div className="d-flex align-items-center justify-content-between mb-3 gap-2">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="regionSelect" className="form-label mb-0">
            Select Region:
          </label>
          <select
            id="regionSelect"
            className="form-select"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{ width: "auto" }}
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region.charAt(0).toUpperCase() + region.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-success"
          onClick={() =>
            (window.location.href = `/admin/halls/add?region=${selectedRegion}`)
          }
        >
          Add New Hall
        </button>
      </div>
      {halls.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Total Seats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {halls.map((hall) => (
              <tr key={hall.id}>
                <td>{hall.id}</td>
                <td>{hall.name}</td>
                <td>{hall.totalSeats}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() =>
                      navigate(
                        `/admin/halls/details/${hall.id}?region=${selectedRegion}`
                      )
                    }
                  >
                    View/Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(hall.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No halls available for the selected region.</p>
      )}
    </div>
  );
};

export default HallListAdmin;
