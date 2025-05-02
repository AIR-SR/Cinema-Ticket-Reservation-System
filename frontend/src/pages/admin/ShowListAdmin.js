import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { Link } from "react-router-dom";

const ShowListAdmin = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await api.get("/show/get_details", {
          params: { region: "krakow" },
        });

        setShows(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error(err);
        setError("Nie udało się pobrać seansów.");
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, []);

const handleDelete = async (showId) => {
  const confirmDelete = window.confirm("Czy na pewno chcesz usunąć ten seans?");
  if (!confirmDelete) return;

  const token = localStorage.getItem("token");
  if (!token) {
    setError("Brak tokena. Zaloguj się ponownie.");
    return;
  }

  try {
    await api.delete(`/show/delete/${showId}`, {
      params: { region: "krakow" },
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



  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1>Lista Seansów</h1>

      <Link to="/admin/shows/add" className="btn btn-primary mb-4">
        Dodaj nowy seans
      </Link>

      {shows.length > 0 ? (
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
      ) : (
        <p>Brak dostępnych seansów.</p>
      )}
    </div>
  );
};

export default ShowListAdmin;
