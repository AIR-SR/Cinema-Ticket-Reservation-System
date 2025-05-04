import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("krakow");

  const handleCinemaSelection = (city) => {
    setSelectedCity(city);
    navigate(`/cinema/${city}?region=${city}`);
  };

  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">Welcome to Cinema Reservation System</h1>
      <p className="mb-4" style={{ fontSize: "1.1rem", color: "#555" }}>
        Book your favorite movies in the best cinemas across Kraków and
        Warszawa. Enjoy a seamless and user-friendly ticket reservation
        experience.
      </p>
      <div className="d-flex justify-content-around mt-4">
        <button
          className="btn btn-light shadow p-3 mb-5 bg-white rounded"
          style={{ border: "1px solid #ddd", transition: "transform 0.2s" }}
          onClick={() => handleCinemaSelection("krakow")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <img
            src="/assets/krakow_icon.png"
            alt="Kraków"
            style={{ width: "200px", height: "200px", marginBottom: "10px" }}
          />
          <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Kraków</p>
        </button>
        <button
          className="btn btn-light shadow p-3 mb-5 bg-white rounded"
          style={{ border: "1px solid #ddd", transition: "transform 0.2s" }}
          onClick={() => handleCinemaSelection("warsaw")}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <img
            src="/assets/warsaw_icon.png"
            alt="Warszawa"
            style={{ width: "200px", height: "200px", marginBottom: "10px" }}
          />
          <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Warszawa</p>
        </button>
      </div>
    </div>
  );
};

export default Homepage;
