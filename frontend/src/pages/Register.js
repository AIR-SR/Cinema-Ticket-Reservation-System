import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import UserForm from "../components/UserForm";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    try {
      await api.post("/users/register", formData);
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error.response || error.message);
      alert(error.response?.data?.detail || "Failed to register.");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Register</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <div className="card-body">
              <UserForm
                formData={formData}
                handleInputChange={handleInputChange}
              />
              <button
                className="btn btn-primary w-100"
                onClick={handleRegister}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
