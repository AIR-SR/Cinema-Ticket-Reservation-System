import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom'; // Import useSearchParams for query parameters
import api from '../../utils/api'; // Import the configured Axios instance

const MovieDetails = () => {
  const { movieId } = useParams(); // Get movie ID from the URL
  const [searchParams] = useSearchParams(); // Get query parameters
  const region = searchParams.get('region'); // Extract the 'region' query parameter
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await api.get(`/movies/get/${movieId}`, {
          params: { region }, // Pass the region as a query parameter
        });
        setMovie(response.data);
      } catch (err) {
        setError('Failed to fetch movie details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId, region]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  if (error)
    return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      {movie && (
        <div className="card shadow-lg">
          <img
            src={movie.posterUrl}
            className="card-img-top"
            alt={`${movie.title} Poster`}
            style={{ maxHeight: '500px', objectFit: 'cover' }}
          />
          <div className="card-body">
            <h1 className="card-title text-center">{movie.title}</h1>
            <p className="card-text mt-3">
              <strong>Release Date:</strong>{' '}
              {new Date(movie.releaseDate).toLocaleDateString()}
            </p>
            <p className="card-text">
              <strong>Description:</strong> {movie.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;