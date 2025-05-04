import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import RegionSelector from "../../components/RegionSelector";

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
        setError(null); // Clear any previous errors
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError(`No movies found for the region '${selectedRegion}'.`);
        } else {
          setError("Failed to fetch movies.");
        }
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
        <RegionSelector
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          regions={regions}
          labelInline={true} // Inline label
          fullWidth={false} // Not full width
        />
        <button
          className="btn btn-success"
          onClick={() =>
            (window.location.href = `/admin/movies/add?region=${selectedRegion}`)
          }
        >
          Add New Movie
        </button>
      </div>
      {moviesByRegion[selectedRegion] &&
      moviesByRegion[selectedRegion].length > 0 ? (
        <div className="mb-5">
          <h2 className="mb-3">
            {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
          </h2>
          <table
            className="table table-striped"
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            <thead>
              <tr>
                <th scope="col" style={{ width: "5%" }}>
                  ID
                </th>
                <th scope="col" style={{ width: "45%" }}>
                  Title
                </th>
                <th scope="col" style={{ width: "30%" }}>
                  TMDB ID
                </th>
                <th scope="col" style={{ width: "20%" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {moviesByRegion[selectedRegion].map((movie) => (
                <tr key={movie.id}>
                  <td>{movie.id}</td>
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
      ) : (
        !loading && (
          <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
            <div className="mb-3">
              <i
                className="bi bi-film"
                style={{ fontSize: "3rem", color: "#6c757d" }}
              ></i>
            </div>
            <p className="mb-3 fs-5 text-muted">
              No movies available for the selected region.
            </p>
            <button
              className="btn btn-success"
              onClick={() =>
                (window.location.href = `/admin/movies/add?region=${selectedRegion}`)
              }
            >
              Add a New Movie
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default MovieListAdmin;
