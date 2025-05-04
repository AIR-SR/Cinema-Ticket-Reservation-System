import React from "react";

const RegionSelector = ({
  selectedRegion,
  setSelectedRegion,
  regions,
  className,
  fullWidth, // Existing prop to control width
  labelInline, // Existing prop to control label positioning
}) => {
  return (
    <div className={className}>
      <div
        className={`d-flex ${
          labelInline ? "align-items-center gap-2" : "flex-column"
        }`} // Adjust layout based on labelInline
      >
        <label
          htmlFor="regionSelect"
          className={`form-label ${labelInline ? "mb-0" : ""}`} // Add mb-0 if labelInline
        >
          Region
        </label>
        <select
          id="regionSelect"
          className={`form-select ${fullWidth ? "w-100" : ""}`} // Adjust width based on fullWidth
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          style={!fullWidth ? { width: "auto" } : {}} // Inline style for small width
        >
          {regions.map((region) => (
            <option key={region} value={region}>
              {region.charAt(0).toUpperCase() + region.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RegionSelector;
