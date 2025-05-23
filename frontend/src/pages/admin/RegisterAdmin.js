import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import UserForm from "../../components/UserForm";

const RegisterAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "", // Default role
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value || "" }); // Ensure fallback to empty string
  };

  const handleRegister = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post("/users/register-admin", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert(`Registration of ${formData.username} successful!`);
      navigate("/users-list");
    } catch (error) {
      console.error("Registration error:", error.response || error.message);
      alert(error.response?.data?.detail || "Failed to register.");
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h1 className="text-center mb-4">Register Admin</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <div className="card-body">
              <UserForm
                formData={formData}
                handleInputChange={handleInputChange}
                includeRole={true}
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

export default RegisterAdmin;
