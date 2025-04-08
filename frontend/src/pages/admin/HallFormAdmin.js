import React, { useState } from "react";
import api from "../../utils/api";

const HallForm = ({ setNewHallId, setSuccessMessage, setErrorMessage, region, setRegion, regions }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token is missing. Please log in.");

      const response = await api.post(
        `/halls/add`,
        { name },
        {
          params: { region },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMessage(`Hall "${response.data.name}" added successfully!`);
      setNewHallId(response.data.id);
      setName("");
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Failed to add the hall. Please try again.");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Hall Name</label>
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
        <label htmlFor="region" className="form-label">Region</label>
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
      <button type="submit" className="btn btn-primary">Add Hall</button>
    </form>
  );
};

export default HallForm;
