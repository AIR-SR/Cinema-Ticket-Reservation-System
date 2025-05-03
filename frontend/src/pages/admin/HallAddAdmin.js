import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HallForm from "../../components/HallFormAdmin";
import HallRowsForm from "../../components/HallRowsFormAdmin";
import RegionSelector from "../../components/RegionSelector";

const HallAddAdmin = () => {
  const location = useLocation();
  const [region, setRegion] = useState("krakow");
  const [regions] = useState(["krakow", "warsaw"]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [newHallId, setNewHallId] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const regionFromQuery = queryParams.get("region");
    if (regionFromQuery && regions.includes(regionFromQuery)) {
      setRegion(regionFromQuery);
    }
  }, [location.search, regions]);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Add New Hall</h1>
      <div className="card">
        <div className="card-body">
          {successMessage && (
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}

          {!newHallId && (
            <HallForm
              setNewHallId={setNewHallId}
              setSuccessMessage={setSuccessMessage}
              setErrorMessage={setErrorMessage}
              region={region}
              setRegion={setRegion}
              regions={regions}
            />
          )}

          {newHallId && <HallRowsForm newHallId={newHallId} region={region} />}
        </div>
      </div>
    </div>
  );
};

export default HallAddAdmin;
