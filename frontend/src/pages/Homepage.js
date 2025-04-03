import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // Adjust the import path as necessary

const Homepage = () => {
    const navigate = useNavigate();
    const [apiStatus, setApiStatus] = useState(null);
    const [apiMessage, setApiMessage] = useState("");
    const [movies, setMovies] = useState([]); // Stan do przechowywania filmów
    const [loading, setLoading] = useState(true); // Stan ładowania
    const [error, setError] = useState(null); // Stan na błędy
    const [selectedCity, setSelectedCity] = useState("global"); // Stan wybranego miasta

    // Sprawdzanie zdrowia API
    useEffect(() => {
        const checkApiHealth = async () => {
          try {
            const response = await api.get("/health"); // Zakładając, że masz endpoint /health
            console.log("API Health Response:", response.data);

            if (response.data.status === "ok" && response.data.message) {
              setApiStatus("connected");
              setApiMessage(response.data.message);
            } else {
              setApiStatus("misconfigured");
              setApiMessage("Unexpected API response format.");
            }
          } catch (error) {
            console.error("API health check failed:", error);
            setApiStatus("disconnected");
            setApiMessage("API is not reachable.");
          }
        };

        checkApiHealth();
    }, []);

    // Pobieranie filmów dla wybranego miasta
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/movies/${selectedCity}`); // Wysłanie zapytania z miastem
                setMovies(response.data); // Przechowuj pobrane filmy
                setLoading(false); // Zakończ ładowanie
            } catch (error) {
                console.error("Failed to fetch movies:", error);
                setError("Failed to load movies.");
                setLoading(false); // Zakończ ładowanie, nawet w przypadku błędu
            }
        };

        fetchMovies();
    }, [selectedCity]); // Zmiana w selectedCity powoduje ponowne pobranie filmów

    return (
        <div className="container mt-5">
            <h1>Homepage</h1>

            {apiStatus === "disconnected" && (
                <div className="alert alert-danger text-center">
                    ⚠️ Unable to connect to the API. Please check your network or backend service.
                </div>
            )}

            {apiStatus === "misconfigured" && (
                <div className="alert alert-warning text-center">
                    ⚠️ API is reachable but returned an unexpected response format.
                </div>
            )}

            {apiStatus === "connected" && (
                <div className="alert alert-success text-center">
                    ✅ {apiMessage}
                </div>
            )}

            {/* Wybór miasta */}
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

            {/* Wyświetlanie listy filmów */}
            {loading ? (
                <div className="text-center">
                    <p>Loading movies...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger text-center">
                    {error}
                </div>
            ) : (
                <div>
                    <h2>Now Playing in {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}</h2>
                    <ul>
                        {movies.map((movie) => (
                            <li key={movie.imbdID}>
                                <strong>{movie.title}</strong> (ID: {movie.imbdID})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Homepage;
