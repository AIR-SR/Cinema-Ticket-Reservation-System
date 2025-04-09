import React, { useState } from "react";
import HallForm from "../../components/HallFormAdmin";
import HallRowsForm from "../../components/HallRowsFormAdmin";

const HallAddAdmin = () => {
  const [region, setRegion] = useState("krakow");
  const [regions] = useState(["krakow", "warsaw"]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [newHallId, setNewHallId] = useState(null);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Add New Hall</h1>

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
  );
};

export default HallAddAdmin;
