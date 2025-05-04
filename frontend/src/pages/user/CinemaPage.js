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
    // Przechodzi do strony rezerwacji biletów dla wybranego seansu
    navigate(`/book-ticket/${movieId}/${showId}?region=${region}`);
  };

  if (loading) return <div className="text-center">Loading movies...</div>;
  if (error)
    return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container mt-5">
      <h1>
        Movies currently played in{" "}
        {city.charAt(0).toUpperCase() + city.slice(1)}
      </h1>
      <ul className="list-group">
        {movies.map((movie) => (
          <li key={movie.id} className="list-group-item">
            <div className="d-flex align-items-center">
              <img
                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                alt={movie.title}
                className="img-thumbnail me-3"
                style={{ width: "100px", height: "150px", objectFit: "cover" }}
              />
              <div>
                <h5>{movie.title}</h5>
                <div className="mt-2">
                  {movie.shows?.length > 0 ? (
                    Object.entries(
                      movie.shows.reduce((acc, show) => {
                        const date = dayjs(show.start_time).format(
                          "DD MMM YYYY"
                        );
                        if (!acc[date]) acc[date] = [];
                        acc[date].push(show);
                        return acc;
                      }, {})
                    ).map(([date, shows]) => (
                      <div key={date} className="mb-3">
                        <strong>{date}</strong>
                        <div>
                          {shows
                            .sort((a, b) =>
                              dayjs(a.start_time).isBefore(dayjs(b.start_time))
                                ? -1
                                : 1
                            )
                            .map((show) => (
                              <button
                                key={show.id}
                                className="btn btn-primary btn-sm me-2 mb-2"
                                onClick={() =>
                                  handleShowBooking(show.id, movie.id)
                                }
                              >
                                {dayjs(show.start_time).format("HH:mm")}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted small">No shows available</div>
                  )}
                </div>
                <button
                  className="btn btn-secondary btn-sm mt-2"
                  onClick={() =>
                    navigate(`/movies/details/${movie.id}?region=${region}`)
                  }
                >
                  View Details
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CinemaPage;
