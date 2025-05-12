import React, { useContext } from "react";
import { Link } from "react-router-dom"; // Removed useNavigate import
import { UserContext } from "../context/UserContext";
import logo from "../assets/logo.png"; // Assuming you have a logo image in the assets folder

const Navbar = () => {
  const { user } = useContext(UserContext);

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark shadow"
      style={{ paddingRight: "15px" }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="Cinema Logo"
            className="me-2"
            style={{ width: "40px", height: "40px" }}
          />
          <span className="fw-bold">LFKG Cinemas</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="/"
                  id="userMenuDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Welcome, {user.first_name}
                </a>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="userMenuDropdown"
                >
                  <li>
                    <Link className="dropdown-item" to="/users/myprofile">
                      My Profile
                    </Link>
                  </li>
                  {user.role === "user" && (
                    <li>
                      <Link className="dropdown-item" to="/users/reservations">
                        My Reservations
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link className="dropdown-item" to="/logout">
                      Logout
                    </Link>
                  </li>
                </ul>
              </li>
            )}
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
