import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState();

  const handleCinemaSelection = (city) => {
    setSelectedCity(city);
    navigate(`/cinema/${city}?region=${city}`);
  };

  const renderCityButton = (city, label, icon) => (
    <div className="col-12 col-md-6 mb-3 mb-md-0 d-flex justify-content-center">
      <button
        className="btn btn-light shadow p-3 bg-white rounded"
        style={{
          border: "1px solid #ddd",
          transition: "transform 0.2s",
          width: "100%",
          maxWidth: "300px",
        }}
        onClick={() => handleCinemaSelection(city)}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <img
          src={icon}
          alt={label}
          style={{
            width: "100%",
            maxWidth: "200px",
            height: "auto",
            marginBottom: "10px",
          }}
        />
        <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{label}</p>
      </button>
    </div>
  );

  return (
    <div className="container mt-5 mb-5 text-center">
      <h1 className="mb-4">Welcome to Cinema Reservation System</h1>
      <p className="mb-4" style={{ fontSize: "1.1rem", color: "#555" }}>
        Book your favorite movies in the best cinemas across Kraków and
        Warszawa. Enjoy a seamless and user-friendly ticket reservation
        experience.
      </p>
      <div className="row mt-4">
        {renderCityButton("krakow", "Krakow", "/assets/krakow_icon.png")}
        {renderCityButton("warsaw", "Warsaw", "/assets/warsaw_icon.png")}
      </div>
    </div>
  );
};

export default Homepage;
