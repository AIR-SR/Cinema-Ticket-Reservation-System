import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

const Logout = () => {
  const { logout } = useContext(UserContext); // Use logout from UserContext
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Warehouse Manager | Logout";
    logout(); // Call the logout function from UserContext
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000); // Redirect to homepage after 3 seconds
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
