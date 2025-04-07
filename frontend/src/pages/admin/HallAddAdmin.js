import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import api from "../../utils/api";

const HallAddAdmin = () => {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("krakow"); // Default region
  const [regions] = useState(["krakow", "warsaw"]); // Available regions
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      if (!token) {
        throw new Error("Authentication token is missing. Please log in.");
      }
      const response = await api.post(
        `/halls/add`,
        { name }, // Send only the name in the request body
        {
          params: { region }, // Send the region as a query parameter
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage(`Hall "${response.data.name}" added successfully!`);
      setName("");
      setTimeout(() => navigate("/admin/halls/list"), 2000); // Redirect after 2 seconds
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail ||
          "Failed to add the hall. Please try again."
      );
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Add New Hall</h1>
      {successMessage && (
        <div className="alert alert-success" role="alert">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Hall Name
          </label>
          <input
            type="text"
            id="name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="region" className="form-label">
            Region
          </label>
          <select
            id="region"
            className="form-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
          >
            {regions.map((regionOption) => (
              <option key={regionOption} value={regionOption}>
                {regionOption.charAt(0).toUpperCase() + regionOption.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Add Hall
        </button>
      </form>
    </div>
  );
};

export default HallAddAdmin;
