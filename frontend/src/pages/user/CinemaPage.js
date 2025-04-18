import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

const CinemaPage = () => {
  const { city } = useParams();
  const [searchParams] = useSearchParams();
  const region = searchParams.get("region");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/movies/get`, {
          params: { region },
        });
        setMovies(data);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        setError("Failed to load movies.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [region]);

  if (loading) {
    return <div className="text-center">Loading movies...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h1>
        Movies and Shows in {city.charAt(0).toUpperCase() + city.slice(1)}
      </h1>
      <div className="row">
        {movies.map((movie) => (
          <div key={movie.tmdbID} className="col-md-4 mb-4 text-center">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="img-fluid rounded"
            />
            <h5 className="mt-2">{movie.title}</h5>
            <button
              className="btn btn-primary mt-2"
              onClick={() =>
                navigate(`/movies/details/${movie.id}?region=${region}`)
              } // Pass region in query
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CinemaPage;
