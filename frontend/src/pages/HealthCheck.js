import React, { useEffect, useState } from 'react';
import api from '../utils/api'; // Import the API utility

const HealthCheck = () => {
    const [healthStatus, setHealthStatus] = useState(null);
    const [adminHealthStatus, setAdminHealthStatus] = useState(null);
    const [userHealthStatus, setUserHealthStatus] = useState(null);
    const [employeeHealthStatus, setEmployeeHealthStatus] = useState(null);

    useEffect(() => {
        const fetchHealthStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await api.get('/health/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setHealthStatus(response.data);
            } catch (error) {
                setHealthStatus({ status: 'error', message: 'Failed to fetch health status' });
            }
        };

        fetchHealthStatus();
    }, []);

    const fetchAdminHealthStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get('/health/admin', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAdminHealthStatus(response.data);
        } catch (error) {
            setAdminHealthStatus({ status: 'error', message: 'Failed to fetch admin health status' });
        }
    };

    const fetchUserHealthStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get('/health/user', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserHealthStatus(response.data);
        } catch (error) {
            setUserHealthStatus({ status: 'error', message: 'Failed to fetch user health status' });
        }
    };

    const fetchEmployeeHealthStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get('/health/employee', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployeeHealthStatus(response.data);
        } catch (error) {
            setEmployeeHealthStatus({ status: 'error', message: 'Failed to fetch employee health status' });
        }
    };

    return (
        <div className="container my-5">
            <header className="text-center mb-4">
                <h1 className="display-4">Health Check Dashboard</h1>
                <p className="lead">Monitor the health status of the API for different user roles.</p>
            </header>
            <main>
                {healthStatus ? (
                    <div className="alert alert-info">
                        <p><strong>Status:</strong> {healthStatus.status}</p>
                        <p><strong>Message:</strong> {healthStatus.message}</p>
                    </div>
                ) : (
                    <p className="text-muted">Loading...</p>
                )}
                <div className="mb-3">
                    <button className="btn btn-primary me-2" onClick={fetchAdminHealthStatus}>Check Admin Health</button>
                    {adminHealthStatus && (
                        <div className="alert alert-warning mt-2">
                            <p><strong>Admin Status:</strong> {adminHealthStatus.status}</p>
                            <p><strong>Admin Message:</strong> {adminHealthStatus.message}</p>
                        </div>
                    )}
                </div>
                <div className="mb-3">
                    <button className="btn btn-secondary me-2" onClick={fetchUserHealthStatus}>Check User Health</button>
                    {userHealthStatus && (
                        <div className="alert alert-success mt-2">
                            <p><strong>User Status:</strong> {userHealthStatus.status}</p>
                            <p><strong>User Message:</strong> {userHealthStatus.message}</p>
                        </div>
                    )}
                </div>
                <div className="mb-3">
                    <button className="btn btn-danger me-2" onClick={fetchEmployeeHealthStatus}>Check Employee Health</button>
                    {employeeHealthStatus && (
                        <div className="alert alert-danger mt-2">
                            <p><strong>Employee Status:</strong> {employeeHealthStatus.status}</p>
                            <p><strong>Employee Message:</strong> {employeeHealthStatus.message}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HealthCheck;
