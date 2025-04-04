import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Styles
import "./styles/modal.css";

// Contexts
import { UserProvider } from "./context/UserContext";

// Components
import Navbar from "./components/Navbar";

import Homepage from "./pages/user/Homepage";
import Login from "./pages/user/Login";
import Logout from "./pages/user/Logout";
import Register from "./pages/user/Register";
import RegisterAdmin from "./pages/admin/RegisterAdmin";
import MyProfile from "./pages/user/MyProfile";
import HealthCheck from './pages/HealthCheck';
import UserList from "./pages/admin/UserList";
import UserDetails from "./pages/admin/UserDetails";
import MovieListAdmin from "./pages/admin/MovieListAdmin";

const PrivateRoute = ({ element, requiredRole }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  try {
    const decodedToken = jwtDecode(token);
    const { role, exp } = decodedToken;

    // Check if the token is expired
    if (Date.now() >= exp * 1000) {
      localStorage.removeItem("token");
      return <Navigate to="/login" />;
    }

    // Check if the user's role is authorized
    if (Array.isArray(requiredRole) ? requiredRole.includes(role) : role === requiredRole) {
      return element;
    }

    return <Navigate to="/" />;
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Health Check */}
          <Route path="/health-check" element={<HealthCheck />} />

          {/* Homepage */}
          <Route path="/" element={<Homepage />} />

          {/* Login */}
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/logout" element={<Logout setToken={setToken} />} />

          {/* Register */}
          <Route path="/register" element={<Register />} />
          <Route path="/register/admin" element={<PrivateRoute element={<RegisterAdmin />} requiredRole={["admin"]} />} />

          {/* Users */}
          <Route path="/users/myprofile" element={<PrivateRoute element={<MyProfile />} requiredRole={["admin", "employee", "user"]} />} />

          {/* Admin */}
          <Route path="/users-list" element={<PrivateRoute element={<UserList />} requiredRole={["admin"]} />} />
          <Route path="/users/details/:userId" element={<PrivateRoute element={<UserDetails />} requiredRole={["admin"]} />} />
          <Route path="/admin/movies/list" element={<PrivateRoute element={<MovieListAdmin />} requiredRole={["admin"]} />} />

        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
