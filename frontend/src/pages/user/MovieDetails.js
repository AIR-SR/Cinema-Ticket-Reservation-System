import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import api from "../../utils/api"; // Import the configured Axios instance
import Loading from "../../components/Loading";
import Error from "../../components/Error";

const MovieDetails = () => {
  const { movieId } = useParams(); // Get movie ID from the URL
  const [searchParams] = useSearchParams(); // Get query parameters
  const navigate = useNavigate(); // Initialize navigate function
  const region = searchParams.get("region"); // Extract the 'region' query parameter
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "LFKG Cinemas | Movie Details"; // Set the document title

    const fetchMovieDetails = async () => {
      try {
        const response = await api.get(`/movies/get/${movieId}`, {
          params: { region }, // Pass the region as a query parameter
        });
        setMovie(response.data);
      } catch (err) {
        setError("Failed to fetch movie details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId, region]);

  if (loading)
    return <Loading message="Fetching the movie details for you..." />;
  if (error)
    return <Error message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="container mt-5 mb-5">
      <button
        className="btn btn-secondary mb-4"
        onClick={() => navigate(-1)} // Go back to the previous page
      >
        Go Back
      </button>
      <div className="card shadow">
        <div className="card-body">
          {movie && (
            <div className="row align-items-center">
              <div className="col-md-4 text-center mb-4 mb-md-0">
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                  alt={`${movie.title} Poster`}
                  className="img-fluid rounded shadow"
                  style={{
                    aspectRatio: "2 / 3",
                    objectFit: "cover",
                    maxWidth: "100%",
                  }}
                />
              </div>
              <div className="col-md-8">
                <h1 className="mb-4">{movie.title}</h1>
                <p>
                  <strong>Release Date:</strong>{" "}
                  {new Date(movie.release_date).toLocaleDateString("en-GB")}
                </p>
                <p>
                  <strong>Runtime:</strong> {movie.runtime} minutes
                </p>
                <p>
                  <strong>Genres:</strong> {movie.genres.join(", ")}
                </p>
                <p>
                  <strong>Description:</strong> {movie.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
