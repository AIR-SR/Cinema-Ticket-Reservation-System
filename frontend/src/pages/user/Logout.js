import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

const Logout = () => {
  const { logout } = useContext(UserContext); // Use logout from UserContext
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "LFKG Cinemas | Logout";
    logout(); // Call the logout function from UserContext
    const timer = setTimeout(() => {
      navigate("/");
    }, 1000); // Redirect to homepage after 1 second
    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [logout, navigate]);

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center">
          <h3 className="mb-0">Logging Out</h3>
        </div>
        <div className="card-body text-center">
          <p>You have been logged out. Redirecting to the homepage...</p>
        </div>
      </div>
    </div>
  );
};

export default Logout;
