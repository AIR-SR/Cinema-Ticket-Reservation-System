import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context/UserContext";
import api from "../../utils/api";
import UserDetailsTable from "../../components/UserDetailsTable";
import Modal from "../../components/Modal";
import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MyProfile = () => {
  const { user, loading, refreshUser } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editField, setEditField] = useState(null);
  const [editedUser, setEditedUser] = useState({ ...user });

  useEffect(() => {
    document.title = "LFKG Cinemas | My Profile";
  }, []);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.warn("Passwords do not match!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User is not authenticated. Please log in again.");
      return;
    }

    try {
      await api.patch(
        "/users/change-password",
        {
          old_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Password updated successfully!");
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update password.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSaveChanges = async (field) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("User is not authenticated. Please log in again.");
      return;
    }

    try {
      // Send only the field being updated
      const payload = { [field]: editedUser[field] };
      await api.patch("/users/update/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await refreshUser();
      toast.success(`${field.replace("_", " ")} updated successfully!`);
    } catch (error) {
      toast.error(error.response?.data?.detail || `Failed to update ${field}.`);
    }
  };

  const handleEditModalOpen = (field) => {
    setEditField(field);
    setEditedUser({ ...editedUser, [field]: user[field] });
  };

  const handleEditModalClose = () => {
    setEditField(null);
  };

  if (loading) return <Loading message="Fetching your profile details..." />;
  if (!user)
    return (
      <ErrorMessage
        message={"User not found"}
        onRetry={() => window.location.reload()}
      />
    );

  return (
    <div className="vh-90 d-flex justify-content-center align-items-center">
      {showModal || editField ? <div className="modal-overlay"></div> : null}
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg">
              <div className="card-header bg-primary text-white text-center">
                <h3 className="mb-0">My Profile</h3>
              </div>
              <div className="card-body p-4">
                <UserDetailsTable
                  user={user}
                  editableFields={[
                    "username",
                    "first_name",
                    "last_name",
                    "email",
                  ]}
                  onEdit={handleEditModalOpen}
                />
                <div className="text-center mt-4">
                  <button
                    className="btn btn-warning"
                    onClick={() => setShowModal(true)}
                  >
                    Edit Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <Modal
          title="Change Password"
          onClose={() => setShowModal(false)}
          onSave={handlePasswordChange}
        >
          <div className="mb-3">
            <label className="form-label" htmlFor="current-password">
              Current Password
            </label>
            <input
              type="password"
              id="current-password"
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="new-password">
              New Password
            </label>
            <input
              type="password"
              id="new-password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {editField && (
        <Modal
          title={`Edit ${editField.replace("_", " ")}`}
          onClose={handleEditModalClose}
          onSave={() => {
            handleSaveChanges(editField);
            handleEditModalClose();
          }}
        >
          <div className="mb-3">
            <label className="form-label">
              {editField.replace("_", " ").toUpperCase()}
            </label>
            <input
              type="text"
              className="form-control"
              name={editField}
              value={editedUser[editField]}
              onChange={handleInputChange}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyProfile;
