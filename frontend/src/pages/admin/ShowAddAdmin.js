import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import RegionSelector from "../../components/RegionSelector"; // Import RegionSelector

const ShowAddAdmin = () => {
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedHallId, setSelectedHallId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [region, setRegion] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [price, setPrice] = useState("15.90");
  const [availableTimes, setAvailableTimes] = useState([]); // Add state for available times
  const [scheduledShows, setScheduledShows] = useState([]); // Add state for scheduled shows

  const navigate = useNavigate();
  const location = useLocation(); // Get location object

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const regionFromQuery = queryParams.get("region");
    if (regionFromQuery && ["krakow", "warsaw"].includes(regionFromQuery)) {
      setRegion(regionFromQuery); // Set region from query params
    }
  }, [location.search]);

  useEffect(() => {
    const fetchMoviesAndHalls = async () => {
      if (!region) return; // Ensure region is set before fetching
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
        console.error("Error fetching movies and halls:", err); // Log error details
        setError("There was a problem loading the data.");
      }
    };

    fetchMoviesAndHalls();
  }, [region]); // Add region as a dependency

  const getAvailableTimes = async () => {
    if (!selectedHallId || !date) {
      return [];
    }

    try {
      const response = await api.get(
        `/show/get_by_hall_and_date/${selectedHallId}`,
        {
          params: {
            date,
            region,
          },
        }
      );

      const existingShows = response.data; // Array of existing shows
      const times = [];
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      for (let hour = 8; hour <= 20; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeStr = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          const startTime = new Date(`${date}T${timeStr}:00`);

          if (
            date === todayStr &&
            (hour < now.getHours() ||
              (hour === now.getHours() && minute <= now.getMinutes()))
          ) {
            continue;
          }

          // Check for conflicts with existing shows
          const hasConflict = existingShows.some((show) => {
            const showStart = new Date(show.start_time);
            const showEnd = new Date(showStart);
            showEnd.setMinutes(showEnd.getMinutes() + show.duration);

            return startTime >= showStart && startTime < showEnd;
          });

          if (!hasConflict) {
            times.push(timeStr);
          }
        }
      }

      return times;
    } catch (err) {
      console.error("Error fetching existing shows:", err);
      setError("There was a problem checking for conflicting shows.");
      return [];
    }
  };

  const fetchScheduledShows = async () => {
    if (!selectedHallId || !date) {
      setScheduledShows([]);
      return;
    }

    try {
      const response = await api.get(
        `/show/get_by_hall_and_date/${selectedHallId}`,
        {
          params: {
            date,
            region,
          },
        }
      );

      const sortedShows = response.data.sort(
        (a, b) => new Date(a.start_time) - new Date(b.start_time)
      ); // Sort shows by start time

      setScheduledShows(sortedShows); // Set sorted scheduled shows
    } catch (err) {
      console.error("Error fetching scheduled shows:", err);
      setError("There was a problem fetching scheduled shows.");
    }
  };

  useEffect(() => {
    const fetchAvailableTimes = async () => {
      const times = await getAvailableTimes();
      setAvailableTimes(times);
    };

    fetchAvailableTimes();
  }, [selectedHallId, date]);

  useEffect(() => {
    fetchScheduledShows();
  }, [selectedHallId, date]); // Fetch scheduled shows when hall or date changes

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMovieId || !selectedHallId || !date || !time) {
      setError("All fields are required!");
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
        throw new Error("No token found. Please log in again.");
      }

      // Check for conflict
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
        setError(
          "Another show is already scheduled in the selected hall at this time."
        );
        return;
      }

      // If no conflict, add the show
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

      setSuccessMessage("The show has been added!");
      setTimeout(() => navigate("/admin/shows/list"), 1500);
    } catch (err) {
      console.error(err);
      setError("There was a problem adding the show.");
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h1 className="text-center mb-4">Add New Show</h1>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}

        <div className="mb-0">
          <RegionSelector
            selectedRegion={region}
            setSelectedRegion={setRegion}
            regions={["krakow", "warsaw"]}
            className="mb-3"
            fullWidth={true}
            labelInline={false}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="movieId" className="form-label">
            Movie
          </label>
          <select
            id="movieId"
            className="form-select"
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
          >
            <option value="">Select a movie</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="hallId" className="form-label">
            Hall
          </label>
          <select
            id="hallId"
            className="form-select"
            value={selectedHallId}
            onChange={(e) => setSelectedHallId(e.target.value)}
          >
            <option value="">Select a hall</option>
            {halls.map((hall) => (
              <option key={hall.id} value={hall.id}>
                {hall.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="date" className="form-label">
            Date
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
            Time
          </label>
          <select
            id="time"
            className="form-select"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          >
            <option value="">Select a time</option>
            {availableTimes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {scheduledShows.length > 0 && (
          <div className="mb-3">
            <h5>Scheduled Shows</h5>
            <ul className="list-group">
              {scheduledShows.map((show) => (
                <li key={show.id} className="list-group-item">
                  {`Movie: ${show.movie_title}, Start: ${new Date(
                    show.start_time
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}, Duration: ${show.duration} mins`}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="price" className="form-label">
            Ticket Price
          </label>
          <select
            id="price"
            className="form-select"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          >
            <option value="15.90">15.90 zł</option>
            <option value="18.90">18.90 zł</option>
            <option value="22.90">22.90 zł</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Add Show
        </button>
      </form>
    </div>
  );
};

export default ShowAddAdmin;
