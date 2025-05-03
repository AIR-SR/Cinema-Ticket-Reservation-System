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
        const moviesResponse = await api.get("/movies/get_title", { params: { region } });
        const hallsResponse = await api.get("/halls/get", { params: { region } });

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
      const timeStr = `${hour.toString().padStart(2, "0")}:00`;
      if (date === todayStr && hour <= now.getHours()) continue; // pomiń przeszłe godziny dla dzisiaj
      times.push(timeStr);
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
  const month = String(startDateTime.getMonth() + 1).padStart(2, '0');
  const day = String(startDateTime.getDate()).padStart(2, '0');
  const hours = String(startDateTime.getHours()).padStart(2, '0');
  const minutes = String(startDateTime.getMinutes()).padStart(2, '0');
  const seconds = String(startDateTime.getSeconds()).padStart(2, '0');

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
    <div className="container mt-4">
      <h1>Dodaj Nowy Seans</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        {/* Wybór regionu */}
        <div className="form-group">
          <label htmlFor="region">Region</label>
          <select
            id="region"
            className="form-control"
            value={region}
            onChange={(e) => setRegion(e.target.value)} // Zmiana regionu
          >
            <option value="krakow">Kraków</option>
            <option value="warsaw">Warszawa</option>
          </select>
        </div>

        {/* Wybór filmu */}
        <div className="form-group">
          <label htmlFor="movieId">Film</label>
          <select
            id="movieId"
            className="form-control"
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

        {/* Wybór sali */}
        <div className="form-group">
          <label htmlFor="hallId">Sala</label>
          <select
            id="hallId"
            className="form-control"
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

        {/* Wybór daty */}
        <div className="form-group">
          <label htmlFor="date">Dzień</label>
          <input
            type="date"
            id="date"
            className="form-control"
            value={date}
            min={new Date().toISOString().split("T")[0]} // Zablokowanie przeszłości
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Wybór godziny */}
        <div className="form-group">
          <label htmlFor="time">Godzina</label>
          <select
            id="time"
            className="form-control"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          >
            <option value="">Wybierz godzinę</option>
            {getAvailableTimes().map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Wybór ceny */}
        <div className="form-group">
          <label htmlFor="price">Cena biletu</label>
          <select
            id="price"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          >
            <option value="15.90">15,90 zł</option>
            <option value="18.90">18,90 zł</option>
            <option value="22.90">22,90 zł</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success mt-4">
          Dodaj Seans
        </button>
      </form>
    </div>
  );
};

export default ShowAddAdmin;
