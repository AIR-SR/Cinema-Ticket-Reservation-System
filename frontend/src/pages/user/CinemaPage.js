import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../../utils/api";

const CinemaPage = () => {
    const { city } = useParams();
    const [searchParams] = useSearchParams();
    const region = searchParams.get("region");
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            <h1>Movies and Shows in {city.charAt(0).toUpperCase() + city.slice(1)}</h1>
            <ul>
                {movies.map((movie) => (
                    <li key={movie.tmdbID}>
                        <strong>{movie.title}</strong> (ID: {movie.tmdbID})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CinemaPage;
