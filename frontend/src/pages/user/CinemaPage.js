import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);

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
        const { data } = await api.get(`/show/movies_with_shows`, {
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

  const handleShowBooking = (showId, movieId) => {
    navigate(`/book-ticket/${movieId}/${showId}?region=${region}`);
  };

  const renderShowButtons = (shows, movieId) => {
    return shows
      .sort((a, b) =>
        dayjs(a.start_time).isBefore(dayjs(b.start_time)) ? -1 : 1
      )
      .map((show) => (
        <button
          key={show.id}
          className="btn btn-outline-primary btn-sm me-2 mb-2"
          onClick={() => handleShowBooking(show.id, movieId)}
          style={{
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#007bff")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          {dayjs(show.start_time).format("HH:mm")}
        </button>
      ));
  };

  const renderMovieShows = (movie) => {
    const groupedShows = movie.shows?.reduce((acc, show) => {
      const date = dayjs(show.start_time).format("DD MMM YYYY");
      if (!acc[date]) acc[date] = [];
      acc[date].push(show);
      return acc;
    }, {});

    return groupedShows ? (
      Object.entries(groupedShows).map(([date, shows]) => (
        <div key={date} className="mb-3">
          <strong>{date}</strong>
          <div className="mt-2">{renderShowButtons(shows, movie.id)}</div>
        </div>
      ))
    ) : (
      <div className="text-muted small">No shows available</div>
    );
  };

  if (loading) return <div className="text-center">Loading movies...</div>;
  if (error)
    return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container mt-5 mb-5">
      <h1 className="text-center mb-5">
        Movies currently played in{" "}
        {city.charAt(0).toUpperCase() + city.slice(1)}
      </h1>
      {movies.length === 0 ? (
        <div className="text-center text-muted">
          Currently there are no movies played in this city.
        </div>
      ) : (
        <div className="row gx-4 gy-4">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="col-md-4 mb-4"
              style={{ transition: "transform 0.2s" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <div className="card shadow-sm h-100">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="card-img-top"
                  style={{
                    height: "300px",
                    objectFit: "contain",
                    backgroundColor: "#f8f9fa",
                  }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{movie.title}</h5>
                  <button
                    className="btn btn-secondary mb-3"
                    onClick={() =>
                      navigate(`/movies/details/${movie.id}?region=${region}`)
                    }
                  >
                    View Details
                  </button>
                  <div className="mt-3 flex-grow-1">
                    {renderMovieShows(movie)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CinemaPage;
