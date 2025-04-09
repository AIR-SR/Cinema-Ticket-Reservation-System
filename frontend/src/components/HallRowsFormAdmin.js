import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const HallRowsForm = ({ newHallId, region }) => {
  const [rowData, setRowData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const addNewRow = () => {
    setRowData([...rowData, { seat_count: "" }]);
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

    // Filtrujemy puste wiersze i tworzymy dane do wysłania
    const validRows = rowData
      .map((row, i) => ({
        hall_id: newHallId,
        row_number: i + 1,
        seat_count: row.seat_count,
      }))
      .filter((row) => row.seat_count); // Usuń puste wiersze, które nie mają przypisanego seat_count

    if (!validRows.length) {
      setError("You must add at least one row.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Authentication token is missing. Please log in.");

      const response = await api.post(
        `/hall_rows/add-rows`, // Endpoint do dodawania rzędów
        validRows, // Dane do wysłania - lista rzędów
        {
          params: { region }, // Przekazujemy region jako parametr
          headers: { Authorization: `Bearer ${token}` }, // Wysłanie tokenu autoryzacyjnego
        }
      );

      // Jeśli operacja jest udana, przekieruj do innej strony lub wyświetl komunikat
      alert("Rows added successfully!");
      navigate("/admin/halls/list"); // Przykład przekierowania po udanym dodaniu rzędów
    } catch (err) {
      console.error("Error adding rows:", err);
      setError("Failed to add rows.");
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
          {rowData.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  value={row.seat_count}
                  onChange={(e) =>
                    updateRow(
                      index,
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
                  onClick={() => removeRow(index)}
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
