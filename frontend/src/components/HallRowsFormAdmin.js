import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const HallRowsForm = ({ newHallId, region }) => {
  const [rowData, setRowData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const addNewRow = () => {
    setRowData([...rowData, { id: Date.now(), seat_count: "" }]); // Add unique ID
  };

  const updateRow = (index, field, value) => {
    const updated = [...rowData];
    updated[index][field] = value;
    setRowData(updated);
  };

  const removeRow = (index) => {
    const updated = [...rowData];
    updated.splice(index, 1);
    setRowData(updated);
  };

  const submitRows = async () => {
    setError(null);

    const validRows = rowData
      .map((row, i) => ({
        hall_id: newHallId,
        row_number: i + 1,
        seat_count: row.seat_count,
      }))
      .filter((row) => row.seat_count);

    if (!validRows.length) {
      setError("You must add at least one row.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Authentication token is missing. Please log in.");

      // First, add rows and retrieve their IDs
      const rowResponse = await api.post(`/hall_rows/add-rows`, validRows, {
        params: { region },
        headers: { Authorization: `Bearer ${token}` },
      });

      const rowsWithIds = rowResponse.data; // Assuming the API returns rows with their IDs

      // Ensure rows are committed before adding seats
      console.log("Rows added successfully:", rowsWithIds);

      // Then, add seats for each row
      for (const row of rowsWithIds) {
        const seats = Array.from({ length: row.seat_count }, (_, i) => ({
          row_id: row.id, // Use the returned row ID
          seat_number: i + 1,
          seat_type: "standard", // Default seat type
        }));

        console.log("Payload for /seat/add-seats:", seats); // Log the payload

        await api.post(`/seat/add-seats`, seats, {
          params: { region },
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success("Rows and seats added successfully!");
      navigate("/admin/halls/list");
    } catch (err) {
      console.error("Error adding rows or seats:", err);
      setError("Failed to add rows or seats.");
    }
  };

  return (
    <div className="mt-5">
      <h3>Add Rows for Hall</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th scope="col">Row Number</th>
            <th scope="col">Seat Count</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rowData.map((row) => (
            <tr key={row.id}>
              {" "}
              {/* Use unique ID as key */}
              <td>{rowData.indexOf(row) + 1}</td>{" "}
              {/* Adjust row number display */}
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.seat_count}
                  onChange={(e) =>
                    updateRow(
                      rowData.indexOf(row),
                      "seat_count",
                      parseInt(e.target.value) || ""
                    )
                  }
                  min={1}
                  required
                />
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeRow(rowData.indexOf(row))}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={addNewRow}
        >
          Add New Row
        </button>
        <button type="button" className="btn btn-success" onClick={submitRows}>
          Submit Rows
        </button>
      </div>
    </div>
  );
};

export default HallRowsForm;
