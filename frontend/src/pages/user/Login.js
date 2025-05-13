import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import api from "../../utils/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state
  const { setUser } = useContext(UserContext); // Access setUser from UserContext
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "LFKG Cinemas | Login";
  }, []);

  const handleLogin = async () => {
    setLoading(true); // Set loading to true when login starts
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await api.post("/login/", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Save token to localStorage
      const token = response.data.access_token;
      console.log("Token:", token);
      localStorage.setItem("token", token);

      // Fetch user details after login
      const userResponse = await api.get("/users/details", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update user in context
      setUser(userResponse.data);

      // Redirect based on role
      if (userResponse.data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error.response || error.message);
      alert("Invalid credentials");
    } finally {
      setLoading(false); // Set loading to false when login finishes
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Login</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <div className="card-body">
              {loading ? ( // Show loading spinner or message
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="form-control"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                  </div>
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleLogin}
                    disabled={loading} // Disable button while loading
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
