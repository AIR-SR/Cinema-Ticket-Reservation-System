import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import HallRowsForm from "../../components/HallRowsFormAdmin";
import RegionSelector from "../../components/RegionSelector";
import api from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HallAddAdmin = () => {
  const location = useLocation();
  const [region, setRegion] = useState("krakow");
  const [regions] = useState(["krakow", "warsaw"]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [newHallId, setNewHallId] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const regionFromQuery = queryParams.get("region");
    if (regionFromQuery && regions.includes(regionFromQuery)) {
      setRegion(regionFromQuery);
    }
  }, [location.search, regions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Authentication token is missing. Please log in.");

      const response = await api.post(
        `/halls/add`,
        { name },
        {
          params: { region },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(`Hall "${response.data.name}" added successfully!`);
      setNewHallId(response.data.id);
      setName("");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail ||
          "Failed to add the hall. Please try again."
      );
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      {/* <ToastContainer /> */}
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
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Hall Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <RegionSelector
                  selectedRegion={region}
                  setSelectedRegion={setRegion}
                  regions={regions}
                  className="form-custom"
                  fullWidth={true} // Pass fullWidth prop to RegionSelector
                  labelInline={false}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Hall
              </button>
            </form>
          )}

          {newHallId && <HallRowsForm newHallId={newHallId} region={region} />}
        </div>
      </div>
    </div>
  );
};

export default HallAddAdmin;
