import React, { useEffect, useState } from "react";
import api from "../utils/api"; // Import the API utility

const HealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [adminHealthStatus, setAdminHealthStatus] = useState(null);
  const [userHealthStatus, setUserHealthStatus] = useState(null);
  const [employeeHealthStatus, setEmployeeHealthStatus] = useState(null);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const { data } = await api.get("/health");
        console.log("API Health Response:", data);

        if (data.status === "ok" && data.message) {
          setHealthStatus({ status: "connected", message: data.message });
        } else {
          setHealthStatus({
            status: "misconfigured",
            message: "Unexpected API response format.",
          });
        }
      } catch (err) {
        console.error("API health check failed:", err);
        setHealthStatus({
          status: "disconnected",
          message: "API is not reachable.",
        });
      }
    };

    checkApiHealth();
  }, []);

  const fetchGroupHealthStatus = async (group, setGroupHealthStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/health/${group}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroupHealthStatus(response.data);
    } catch (error) {
      setGroupHealthStatus({
        status: "error",
        message: `Failed to fetch ${group} health status`,
      });
    }
  };

  const renderHealthStatus = (status, group) => {
    if (!status) {
      return <p className="text-muted">Checking {group} health...</p>;
    }

    let alertClass;
    if (status.status === "connected") {
      alertClass = "alert-success";
    } else if (status.status === "misconfigured") {
      alertClass = "alert-warning";
    } else {
      alertClass = "alert-danger";
    }

    return (
      <div className={`alert ${alertClass} mt-2`}>
        <p>
          <strong>{group} Status:</strong> {status.status}
        </p>
        <p>
          <strong>{group} Message:</strong> {status.message}
        </p>
      </div>
    );
  };

  return (
    <div className="container py-5">
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold">Health Check Dashboard</h1>
        <p className="text-muted">
          Monitor the health status of the API and user groups.
        </p>
      </header>
      <main>
        <section className="mb-5">
          <h2 className="h4">API Health</h2>
          {healthStatus ? (
            <div
              className={`alert ${
                healthStatus.status === "connected"
                  ? "alert-success"
                  : "alert-danger"
              }`}
            >
              <p>
                <strong>Status:</strong> {healthStatus.status}
              </p>
              <p>
                <strong>Message:</strong> {healthStatus.message}
              </p>
            </div>
          ) : (
            <p className="text-muted">Checking API health...</p>
          )}
        </section>
        <section>
          <h2 className="h4">User Group Health</h2>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Group</th>
                <th>Action</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Admin</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      fetchGroupHealthStatus("admin", setAdminHealthStatus)
                    }
                  >
                    Check Admin Health
                  </button>
                </td>
                <td>{renderHealthStatus(adminHealthStatus, "Admin")}</td>
              </tr>
              <tr>
                <td>User</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      fetchGroupHealthStatus("user", setUserHealthStatus)
                    }
                  >
                    Check User Health
                  </button>
                </td>
                <td>{renderHealthStatus(userHealthStatus, "User")}</td>
              </tr>
              <tr>
                <td>Employee</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      fetchGroupHealthStatus(
                        "employee",
                        setEmployeeHealthStatus
                      )
                    }
                  >
                    Check Employee Health
                  </button>
                </td>
                <td>{renderHealthStatus(employeeHealthStatus, "Employee")}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default HealthCheck;
