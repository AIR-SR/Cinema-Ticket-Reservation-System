import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = ({ label = "Back", navigateTo = -1 }) => {
  const navigate = useNavigate();

  return (
    <button className="btn btn-secondary" onClick={() => navigate(navigateTo)}>
      {label}
    </button>
  );
};

export default BackButton;
