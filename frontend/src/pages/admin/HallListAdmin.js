import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const HallListAdmin = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("krakow"); // Default region
  const [regions, setRegions] = useState(["krakow", "warsaw"]); // Available regions

  useEffect(() => {
    const fetchHalls = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/halls/get`, {
          params: { region: selectedRegion },
        });
        setHalls(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError(`No halls found for the region '${selectedRegion}'.`);
        } else {
          setError("Failed to fetch halls.");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

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
          onClick={() => (window.location.href = "/admin/halls/add")}
        >
          Add New Hall
        </button>
      </div>
      {halls.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
            </tr>
          </thead>
          <tbody>
            {halls.map((hall) => (
              <tr key={hall.id}>
                <td>{hall.id}</td>
                <td>{hall.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
          <div className="mb-3">
            <i className="bi bi-building" style={{ fontSize: "3rem", color: "#6c757d" }}></i>
          </div>
          <p className="mb-3 fs-5 text-muted">No halls available for the selected region.</p>
          <button
            className="btn btn-success"
            onClick={() => (window.location.href = "/admin/halls/add")}
          >
            Add a New Hall
          </button>
        </div>
      )}
    </div>
  );
};

export default HallListAdmin;
