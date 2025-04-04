import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // Adjust the import path as necessary

const Homepage = () => {
    const navigate = useNavigate();
    const [apiStatus, setApiStatus] = useState(null);
    const [apiMessage, setApiMessage] = useState("");
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCity, setSelectedCity] = useState("krakow");

    // Check API health
    useEffect(() => {
        const checkApiHealth = async () => {
            try {
                const { data } = await api.get("/health");
                console.log("API Health Response:", data);

                if (data.status === "ok" && data.message) {
                    setApiStatus("connected");
                    setApiMessage(data.message);
                } else {
                    setApiStatus("misconfigured");
                    setApiMessage("Unexpected API response format.");
                }
            } catch (err) {
                console.error("API health check failed:", err);
                setApiStatus("disconnected");
                setApiMessage("API is not reachable.");
            }
        };

        checkApiHealth();
    }, []);

    // Fetch movies for the selected city
    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            setError(null); // Reset error state before fetching
            try {
                const { data } = await api.get(`/movies/get/all?region=${selectedCity}`);
                setMovies(data);
                console.log("Movies fetched:", data);
            } catch (err) {
                console.error("Failed to fetch movies:", err);
                setError("Failed to load movies.");
            } finally {
                setLoading(false); // Ensure loading state is updated
            }
        };

        fetchMovies();
    }, [selectedCity]);

    const renderApiStatus = () => {
        if (apiStatus === "disconnected") {
            return (
                <div className="alert alert-danger text-center">
                    ⚠️ Unable to connect to the API. Please check your network or backend service.
                </div>
            );
        }
        if (apiStatus === "misconfigured") {
            return (
                <div className="alert alert-warning text-center">
                    ⚠️ API is reachable but returned an unexpected response format.
                </div>
            );
        }
        if (apiStatus === "connected") {
            return (
                <div className="alert alert-success text-center">
                    ✅ {apiMessage}
                </div>
            );
        }
        return null;
    };

    const renderMovies = () => {
        if (loading) {
            return (
                <div className="text-center">
                    <p>Loading movies...</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="alert alert-danger text-center">
                    {error}
                </div>
            );
        }
        return (
            <div>
                <h2>Now Playing in {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}</h2>
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

    return (
        <div className="container mt-5">
            <h1>Homepage</h1>
            {renderApiStatus()}
            <div className="form-group">
                <label htmlFor="city">Select City</label>
                <select
                    id="city"
                    className="form-control"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                >
                    <option value="krakow">Kraków</option>
                    <option value="warsaw">Warszawa</option>
                </select>
            </div>
            {renderMovies()}
        </div>
    );
};

export default Homepage;
