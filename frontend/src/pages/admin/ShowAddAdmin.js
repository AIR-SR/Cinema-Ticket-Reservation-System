import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";

const ShowAddAdmin = () => {
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedHallId, setSelectedHallId] = useState("");
  const [date, setDate] = useState("");
  const [region, setRegion] = useState("krakow"); // Ustawienie domyślnego regionu na "krakow"
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [price, setPrice] = useState("15.90");

  const navigate = useNavigate();

  // Funkcja do pobierania filmów i sal
  useEffect(() => {
    const fetchMoviesAndHalls = async () => {
      try {
        const moviesResponse = await api.get("/movies/get_title", { params: { region } });
        console.log(moviesResponse.data); // Sprawdź, co zawiera odpowiedź
        const hallsResponse = await api.get("/halls/get", { params: { region } });

        setMovies(moviesResponse.data); // Przypisz filmy
        setHalls(hallsResponse.data); // Przypisz sale
      } catch (err) {
        setError("Wystąpił problem podczas ładowania danych.");
      }
    };

    fetchMoviesAndHalls();
  }, [region]); // Ponownie załaduj dane po zmianie regionu


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMovieId || !selectedHallId || !date) {
      setError("Wszystkie pola są wymagane!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Brak tokena. Zaloguj się ponownie.");
      }

      const newShow = {
        movie_id: parseInt(selectedMovieId),
        hall_id: parseInt(selectedHallId),
        start_time: date,
        price: 20.0, // lub dodaj pole formularza dla ceny
      };

      console.log("Wysyłam:", newShow);

      const response = await api.post("/show/add", newShow, {
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
                {hall.name} {/* Wyświetlanie nazwy sali */}
              </option>
            ))}
          </select>
        </div>

        {/* Wybór daty */}
        <div className="form-group">
          <label htmlFor="date">Data i godzina</label>
          <input
            type="datetime-local"
            id="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

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
