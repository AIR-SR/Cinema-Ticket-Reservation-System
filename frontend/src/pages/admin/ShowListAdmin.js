import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import RegionSelector from "../../components/RegionSelector";
import BackButton from "../../components/BackButton";

const ShowListAdmin = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("krakow"); // Default region
  const [regions] = useState(["krakow", "warsaw"]); // List of regions

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
        setError("Failed to fetch shows.");
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [selectedRegion]); // Re-fetch shows when selectedRegion changes

  const handleDelete = async (showId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this show?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in again.");
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
      setError("An error occurred while deleting the show.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Show List</h1>
      <div className="d-flex align-items-center justify-content-between mb-3 gap-2">
        <RegionSelector
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          regions={regions}
          labelInline={true} // Inline label
          fullWidth={false} // Not full width
          showAllOption={true}
        />
        <Link
          to={`/admin/shows/add?region=${selectedRegion}`}
          className="btn btn-success"
        >
          Add New Show
        </Link>
      </div>
      {shows.length > 0 ? (
        <div className="mb-5">
          <h2 className="mb-3">
            {selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
          </h2>
          <table
            className="table table-striped"
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            <thead>
              <tr>
                <th scope="col" style={{ width: "5%" }}>
                  #
                </th>
                <th scope="col" style={{ width: "30%" }}>
                  Movie Title
                </th>
                <th scope="col" style={{ width: "25%" }}>
                  Date and Time
                </th>
                <th scope="col" style={{ width: "20%" }}>
                  Hall
                </th>
                <th scope="col" style={{ width: "15%" }}>
                  Ticket Price
                </th>
                <th scope="col" style={{ width: "10%" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => (
                <tr key={show.id}>
                  <td>{show.id}</td>
                  <td>{show.movie_title}</td>
                  <td>
                    {new Date(show.start_time).toLocaleString("en-GB", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>{show.hall_name}</td>
                  <td>{show.price} PLN</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(show.id)}
                    >
                      Delete
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
              No shows available for the selected region.
            </p>
            <Link
              to={`/admin/shows/add?region=${selectedRegion}`}
              className="btn btn-primary"
            >
              Add New Show
            </Link>
          </div>
        )
      )}
      <div className="d-flex justify-content-start mt-4">
        <BackButton />
      </div>
    </div>
  );
};

export default ShowListAdmin;
