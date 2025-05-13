import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import UserDetailsTable from "../../components/UserDetailsTable";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      console.error("User ID is undefined in UserDetails");
      return;
    }
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`/users/get/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDeleteUser = async () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/users/delete/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("User deleted successfully.");
        navigate("/users-list");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  if (loading) return <Loading message="Loading user details..." />;
  if (error)
    return (
      <ErrorMessage message={error} onRetry={() => window.location.reload()} />
    );

  if (!user) {
    return (
      <ErrorMessage
        message={"User not found"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="vh-90 d-flex justify-content-center align-items-center">
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white text-center">
                <h3 className="mb-0">User Details</h3>
              </div>
              <div className="card-body p-4">
                <UserDetailsTable user={user} />
                <div className="d-flex justify-content-between mt-4">
                  <button className="btn btn-secondary" onClick={handleGoBack}>
                    Go Back
                  </button>
                  <button className="btn btn-danger" onClick={handleDeleteUser}>
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
