import React from "react";

const UserForm = ({ formData, handleInputChange, includeRole = false }) => {
  return (
    <>
      <div className="mb-3">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className="form-control"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="first_name" className="form-label">
          First Name
        </label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          className="form-control"
          placeholder="Enter your first name"
          value={formData.first_name}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="last_name" className="form-label">
          Last Name
        </label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          className="form-control"
          placeholder="Enter your last name"
          value={formData.last_name}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
        />
      </div>
      {includeRole && (
        <div className="mb-3">
          <label htmlFor="role" className="form-label">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="form-control"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value="" disabled>
              Select a role
            </option>
            <optgroup label="Standard Roles">
              <option value="user">User</option>
            </optgroup>
            <optgroup label="Administrative Roles">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </optgroup>
          </select>
        </div>
      )}
    </>
  );
};

export default UserForm;
