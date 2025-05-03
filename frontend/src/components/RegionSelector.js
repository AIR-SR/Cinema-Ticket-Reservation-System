import React from "react";

const RegionSelector = ({ selectedRegion, setSelectedRegion, regions }) => {
  return (
    <div className="d-flex align-items-center gap-2">
      <label htmlFor="regionSelect" className="form-label mb-0">
        Select Region:
      </label>
      <select
        id="regionSelect"
        className="form-select"
        value={selectedRegion}
        onChange={(e) => setSelectedRegion(e.target.value)}
        style={{ width: "auto" }}
      >
        {regions.map((region) => (
          <option key={region} value={region}>
            {region.charAt(0).toUpperCase() + region.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RegionSelector;
