import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const Footer = () => {
  const { user } = useContext(UserContext);

  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <div className="container d-flex justify-content-between align-items-center">
        {/* <p className="mb-0">Cinema Ticket Reservation System</p> */}
        <a
          href="https://github.com/AIR-SR/Cinema-Ticket-Reservation-System"
          className="text-light"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <div className="d-flex gap-3">
          <Link className="text-light" to="/health-check">
            Health Check
          </Link>
          {user?.role === "admin" && (
            <Link className="text-light" to="/admin/dashboard">
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
