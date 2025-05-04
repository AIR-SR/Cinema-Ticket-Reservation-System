import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const UserContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
  logout: () => {},
  refreshUser: () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error("Error decoding token:", error);
      return true;
    }
  };

  const handleTokenAndFetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        if (isTokenExpired(token)) {
          console.warn("Token is expired");
          localStorage.removeItem("token");
          setUser(null);
          window.location.href = "/login"; // Redirect to login
          return;
        }
        const response = await api.get("/users/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error handling token or fetching user details:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
        window.location.href = "/login"; // Redirect to login
      }
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      await handleTokenAndFetchUser();
      setLoading(false);
    };

    fetchUserDetails();

    // Periodic token expiration check
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        console.warn("Token expired. Logging out...");
        logout();
        window.location.reload(); // Reload the page to reflect the logout state
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = async () => {
    await handleTokenAndFetchUser();
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, loading, logout, refreshUser }}
    >
      {children}
    </UserContext.Provider>
  );
};
