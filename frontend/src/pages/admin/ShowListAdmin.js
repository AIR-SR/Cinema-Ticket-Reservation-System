import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import RegionSelector from "../../components/RegionSelector";

const ShowListAdmin = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("krakow"); // Default region
  const [regions, setRegions] = useState(["krakow", "warsaw"]); // List of regions

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await api.get("/show/get_details", {
          params: { region: selectedRegion },
        });

        setShows(Array.isArray(response.data) ? response.data : []);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać seansów.");
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [selectedRegion]); // Re-fetch shows when selectedRegion changes

  const handleDelete = async (showId) => {
    const confirmDelete = window.confirm(
      "Czy na pewno chcesz usunąć ten seans?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Brak tokena. Zaloguj się ponownie.");
      return;
    }

    try {
      await api.delete(`/show/delete/${showId}`, {
        params: { region: selectedRegion },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShows((prevShows) => prevShows.filter((show) => show.id !== showId));
    } catch (err) {
      console.error(err);
      setError("Wystąpił problem podczas usuwania seansu.");
    }
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Lista Seansów</h1>
      <div className="d-flex align-items-center justify-content-between mb-3 gap-2">
        <RegionSelector
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          regions={regions}
        />
        <Link
          to={`/admin/shows/add?region=${selectedRegion}`}
          className="btn btn-success"
        >
          Dodaj nowy seans
        </Link>
      </div>
      {shows.length > 0 ? (
        <div className="mb-5">
          <h2 className="mb-3">
            {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
          </h2>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Nazwa filmu</th>
                <th>Data i godzina</th>
                <th>Sala</th>
                <th>Cena biletu</th>
                <th>Region</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => (
                <tr key={show.id}>
                  <td>{show.id}</td>
                  <td>{show.movie_title}</td>
                  <td>
                    {new Date(show.start_time).toLocaleString("pl-PL", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>{show.hall_name}</td>
                  <td>{show.price} PLN</td>
                  <td>{show.region}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(show.id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <div className="d-flex flex-column align-items-center justify-content-center text-center py-5">
            <div className="mb-3">
              <i
                className="bi bi-calendar2-event"
                style={{ fontSize: "3rem", color: "#6c757d" }}
              ></i>
            </div>
            <p className="mb-3 fs-5 text-muted">
              Brak dostępnych seansów dla wybranego regionu.
            </p>
            <Link
              to={`/admin/shows/add?region=${selectedRegion}`}
              className="btn btn-primary"
            >
              Dodaj nowy seans
            </Link>
          </div>
        )
      )}
    </div>
  );
};

export default ShowListAdmin;
