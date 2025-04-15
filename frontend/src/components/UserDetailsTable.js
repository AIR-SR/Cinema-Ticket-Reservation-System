import React from "react";

const UserDetailsTable = ({ user, editableFields = [], onEdit }) => {
  return (
    <table className="table table-bordered mx-auto" style={{ maxWidth: "90%" }}>
      <tbody>
        {Object.keys(user)
          .filter((field) => field !== "id")
          .map((field) => (
            <tr key={field}>
              <th className="fw-bold">
                {field.replace("_", " ").toUpperCase()}
              </th>
              <td>
                <div className="d-flex justify-content-between align-items-center">
                  <span>{user[field]?.toString()}</span>
                  {editableFields.includes(field) && onEdit && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onEdit(field)}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default UserDetailsTable;
