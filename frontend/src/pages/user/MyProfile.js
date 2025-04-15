import React, { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import api from "../../utils/api";
import UserDetailsTable from "../../components/UserDetailsTable";
import Modal from "../../components/Modal";

const MyProfile = () => {
  const { user, loading, refreshUser } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editField, setEditField] = useState(null);
  const [editedUser, setEditedUser] = useState({ ...user });

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("User is not authenticated. Please log in again.");
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

      alert("Password updated successfully!");
      setShowModal(false);
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to update password.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleSaveChanges = async (field) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User is not authenticated. Please log in again.");
      return;
    }

    try {
      // Send only the field being updated
      const payload = { [field]: editedUser[field] };
      await api.patch("/users/update/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await refreshUser();
      alert(`${field.replace("_", " ")} updated successfully!`);
    } catch (error) {
      alert(error.response?.data?.detail || `Failed to update ${field}.`);
    }
  };

  const handleEditModalOpen = (field) => {
    setEditField(field);
    setEditedUser({ ...editedUser, [field]: user[field] });
  };

  const handleEditModalClose = () => {
    setEditField(null);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center mt-5">No user data available.</div>;
  }

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center">
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
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-control"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
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
