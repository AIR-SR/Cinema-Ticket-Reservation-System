import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import api from "../utils/api";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setUser } = useContext(UserContext); // Access setUser from UserContext
    const navigate = useNavigate();

    const handleLogin = async () => {
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

            // Redirect to homepage
            // navigate("/users/myprofile");
            navigate("/");
        } catch (error) {
            console.error("Login error:", error.response || error.message);
            alert("Invalid credentials");
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Login</h1>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card p-4 shadow-sm">
                        <div className="card-body">
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">Username</label>
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
                                <label htmlFor="password" className="form-label">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleLogin()} // Trigger login on Enter
                                />
                            </div>
                            <button className="btn btn-primary w-100" onClick={handleLogin}>
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;