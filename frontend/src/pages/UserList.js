import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Warehouse Manager | User List";

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/users/get", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users. Please try again later.");
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    navigate("/register/admin");
  };

  const handleViewDetails = (userId) => {
    if (!userId) {
      console.error("User ID is undefined");
      return;
    }
    navigate(`/users/details/${userId}`);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">User List</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="d-flex justify-content-between mb-3">
        <h2>Users</h2>
        <button className="btn btn-primary" onClick={handleAddUser}>
          Add User
        </button>
      </div>
      {users.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>{user.is_active ? "Yes" : "No"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleViewDetails(user.id)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center">No users found.</p>
      )}
    </div>
  );
};

export default UserList;