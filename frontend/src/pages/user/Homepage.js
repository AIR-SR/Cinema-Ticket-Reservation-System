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
    <div className="container mt-5">
      <h1>Welcome to Cinema Reservation System</h1>
      <div className="d-flex justify-content-around mt-4">
        <button
          className="btn btn-light"
          onClick={() => handleCinemaSelection("krakow")}
        >
          <img
            src="/assets/herb_krakow.jpg"
            alt="Kraków"
            style={{ width: "200px", height: "200px" }}
          />
          <p>Kraków</p>
        </button>
        <button
          className="btn btn-light"
          onClick={() => handleCinemaSelection("warsaw")}
        >
          <img
            src="/assets/warsaw_herb.jpg"
            alt="Warszawa"
            style={{ width: "200px", height: "200px" }}
          />
          <p>Warszawa</p>
        </button>
      </div>
    </div>
  );
};

export default Homepage;
