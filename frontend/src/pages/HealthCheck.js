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
    const alertClass =
      status.status === "connected"
        ? "alert-success"
        : status.status === "misconfigured"
        ? "alert-warning"
        : "alert-danger";

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
    <div className="container my-5">
      <header className="text-center mb-4">
        <h1 className="display-4">Health Check Dashboard</h1>
        <p className="lead">
          Monitor the health status of the API and user groups.
        </p>
      </header>
      <main>
        <section className="mb-4">
          <h2>API Health</h2>
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
        <section className="mb-4">
          <h2>User Group Health</h2>
          <div className="mb-3">
            <button
              className="btn btn-primary me-2"
              onClick={() =>
                fetchGroupHealthStatus("admin", setAdminHealthStatus)
              }
            >
              Check Admin Health
            </button>
            {renderHealthStatus(adminHealthStatus, "Admin")}
          </div>
          <div className="mb-3">
            <button
              className="btn btn-secondary me-2"
              onClick={() =>
                fetchGroupHealthStatus("user", setUserHealthStatus)
              }
            >
              Check User Health
            </button>
            {renderHealthStatus(userHealthStatus, "User")}
          </div>
          <div className="mb-3">
            <button
              className="btn btn-danger me-2"
              onClick={() =>
                fetchGroupHealthStatus("employee", setEmployeeHealthStatus)
              }
            >
              Check Employee Health
            </button>
            {renderHealthStatus(employeeHealthStatus, "Employee")}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HealthCheck;
