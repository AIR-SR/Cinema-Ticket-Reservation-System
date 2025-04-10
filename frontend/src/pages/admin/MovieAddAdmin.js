import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../../utils/api";
import { UserContext } from "../../context/UserContext";

const MovieAddAdmin = () => {
  const { user } = useContext(UserContext); // Access user context
  const location = useLocation(); // Access location object
  const [tmdbID, setTmdbID] = useState("");
  const [region, setRegion] = useState("krakow");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const regionFromQuery = queryParams.get("region");
    if (regionFromQuery && ["krakow", "warsaw"].includes(regionFromQuery)) {
      setRegion(regionFromQuery);
    }
  }, [location.search]);

  const handleAddMovie = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      if (!token) {
        throw new Error("Authentication token is missing. Please log in.");
      }

      const response = await api.post(
        "/movies/add",
        { tmdbID },
        {
          params: { region },
          headers: { Authorization: `Bearer ${token}` }, // Pass token in headers
        }
      );
      setSuccessMessage(`Movie "${response.data.title}" added successfully!`);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail ||
          "An error occurred while adding the movie."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Add a New Movie</h1>
      <form onSubmit={handleAddMovie} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label htmlFor="tmdbID" className="form-label">
            TMDB ID:
          </label>
          <input
            type="text"
            id="tmdbID"
            className="form-control"
            value={tmdbID}
            onChange={(e) => setTmdbID(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="region" className="form-label">
            Region:
          </label>
          <select
            id="region"
            className="form-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="krakow">Krakow</option>
            <option value="warsaw">Warsaw</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Movie"}
        </button>
      </form>
      {successMessage && (
        <p className="text-success text-center mt-3">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-danger text-center mt-3">{errorMessage}</p>
      )}
    </div>
  );
};

export default MovieAddAdmin;
