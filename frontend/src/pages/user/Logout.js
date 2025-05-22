import React, { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { toast } from "react-toastify";

const Logout = () => {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    if (hasLoggedOut.current) return;
    hasLoggedOut.current = true;
    document.title = "LFKG Cinemas | Logout";
    logout();
    toast.info("You have been logged out.");
    navigate("/");
  }, [logout, navigate]);

  return null;
};

export default Logout;
