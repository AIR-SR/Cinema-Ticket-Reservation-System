import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const MovieListAdmin = () => {
  const [moviesByRegion, setMoviesByRegion] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("krakow"); // Default to the first region
  const [regions, setRegions] = useState(["krakow", "warsaw"]); // List of regions

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch movies for the selected region
        const response = await api.get(`/movies/get?region=${selectedRegion}`);
        const movies = response.data.map((movie) => ({
          ...movie,
          region: selectedRegion,
        }));

        // Group movies by region (only one region in this case)
        const groupedByRegion = {
          [selectedRegion]: movies,
        };

        setMoviesByRegion(groupedByRegion);
      } catch (err) {
        setError("Failed to fetch movies.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedRegion]); // Re-fetch movies when selectedRegion changes

  const handleViewDetails = (movieId, region) => {
    // Navigate to the movie details page with the region as a query parameter
    window.location.href = `/movies/details/${movieId}?region=${region}`;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Movie List by Region</h1>
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
          onClick={() => (window.location.href = "/admin/movies/add")}
        >
          Add New Movie
        </button>
      </div>
      {moviesByRegion[selectedRegion] && (
        <div className="mb-5">
          <h2 className="mb-3">
            {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
          </h2>
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">TMDB ID</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {moviesByRegion[selectedRegion].map((movie) => (
                <tr key={movie.id}>
                  <td>{movie.title}</td>
                  <td>{movie.tmdbID}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleViewDetails(movie.id, movie.region)} // Pass the region here
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MovieListAdmin;