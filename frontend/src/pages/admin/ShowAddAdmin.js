import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const ShowAddAdmin = () => {
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedHallId, setSelectedHallId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [region, setRegion] = useState("krakow");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [price, setPrice] = useState("15.90");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMoviesAndHalls = async () => {
      try {
        const moviesResponse = await api.get("/movies/get_title", {
          params: { region },
        });
        const hallsResponse = await api.get("/halls/get", {
          params: { region },
        });

        setMovies(moviesResponse.data);
        setHalls(hallsResponse.data);
      } catch (err) {
        setError("Wystąpił problem podczas ładowania danych.");
      }
    };

    fetchMoviesAndHalls();
  }, [region]);

  const getAvailableTimes = () => {
    const times = [];
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        if (
          date === todayStr &&
          (hour < now.getHours() ||
            (hour === now.getHours() && minute <= now.getMinutes()))
        ) {
          continue;
        }

        times.push(timeStr);
      }
    }

    return times;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMovieId || !selectedHallId || !date || !time) {
      setError("Wszystkie pola są wymagane!");
      return;
    }

    const startDateTime = new Date(`${date}T${time}:00`);

    const year = startDateTime.getFullYear();
    const month = String(startDateTime.getMonth() + 1).padStart(2, "0");
    const day = String(startDateTime.getDate()).padStart(2, "0");
    const hours = String(startDateTime.getHours()).padStart(2, "0");
    const minutes = String(startDateTime.getMinutes()).padStart(2, "0");
    const seconds = String(startDateTime.getSeconds()).padStart(2, "0");

    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Brak tokena. Zaloguj się ponownie.");
      }

      // Sprawdzenie konfliktu
      const conflictResponse = await api.get("show/check_conflict", {
        params: {
          hall_id: selectedHallId,
          movie_id: selectedMovieId,
          start_time: formattedDateTime,
          region: region,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (conflictResponse.data.conflict) {
        setError("W wybranej sali trwa już inny seans w tym czasie.");
        return;
      }

      // Jeśli brak konfliktu, dodaj seans
      const newShow = {
        movie_id: parseInt(selectedMovieId),
        hall_id: parseInt(selectedHallId),
        start_time: formattedDateTime.replace("T", " "), // API expects space not 'T'
        price: parseFloat(price),
      };

      await api.post("/show/add", newShow, {
        params: { region },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage("Seans został dodany!");
      setTimeout(() => navigate("/admin/shows/list"), 1500);
    } catch (err) {
      console.error(err);
      setError("Wystąpił problem podczas dodawania seansu.");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Dodaj Nowy Seans</h1>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        <div className="mb-3">
          <label htmlFor="region" className="form-label">
            Region
          </label>
          <select
            id="region"
            className="form-select"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="krakow">Kraków</option>
            <option value="warsaw">Warszawa</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="movieId" className="form-label">
            Film
          </label>
          <select
            id="movieId"
            className="form-select"
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
          >
            <option value="">Wybierz film</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="hallId" className="form-label">
            Sala
          </label>
          <select
            id="hallId"
            className="form-select"
            value={selectedHallId}
            onChange={(e) => setSelectedHallId(e.target.value)}
          >
            <option value="">Wybierz salę</option>
            {halls.map((hall) => (
              <option key={hall.id} value={hall.id}>
                {hall.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="date" className="form-label">
            Dzień
          </label>
          <input
            type="date"
            id="date"
            className="form-control"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="time" className="form-label">
            Godzina
          </label>
          <select
            id="time"
            className="form-select"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          >
            <option value="">Wybierz godzinę</option>
            {getAvailableTimes().map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="price" className="form-label">
            Cena biletu
          </label>
          <select
            id="price"
            className="form-select"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          >
            <option value="15.90">15,90 zł</option>
            <option value="18.90">18,90 zł</option>
            <option value="22.90">22,90 zł</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Dodaj Seans
        </button>
      </form>
    </div>
  );
};

export default ShowAddAdmin;
