import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Styles
import "./styles/modal.css";

// Contexts
import { UserProvider } from "./context/UserContext";

// Components
import Navbar from "./components/Navbar";

import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import MyProfile from "./pages/MyProfile";

const PrivateRoute = ({ element, requiredRole }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  const decodedToken = jwtDecode(token);
  const userRole = decodedToken.role;

  // Check if the user's role is included in the requiredRole list
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole) ? element : <Navigate to="/" />;
  }

  // Fallback for single role (if requiredRole is not an array)
  return userRole === requiredRole ? element : <Navigate to="/" />;
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Homepage />} />

          {/* Login */}
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/logout" element={<Logout setToken={setToken} />} />

          {/* Register */}
          <Route path="/register" element={<Register />} />

          {/* Users */}
          <Route path="/users/myprofile" element={<PrivateRoute element={<MyProfile />} requiredRole={["admin", "employee", "user"]} />} />

        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
