import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Admin Dashboard</h1>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Manage Users</h5>
              <p className="card-text">View and manage user accounts.</p>
              <Link to="/users-list" className="btn btn-primary">
                Go to Users
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Manage Movies</h5>
              <p className="card-text">Add, edit, or delete movies.</p>
              <Link to="/admin/movies/list" className="btn btn-primary">
                Go to Movies
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Manage Halls</h5>
              <p className="card-text">Add, edit, or delete cinema halls.</p>
              <Link to="/admin/halls/list" className="btn btn-primary">
                Go to Halls
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Manage Shows</h5>
              <p className="card-text">Add, edit, or delete shows.</p>
              <Link to="/admin/shows/list" className="btn btn-primary">
                Go to Shows
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">Manage Reservations</h5>
              <p className="card-text">Add, edit, or delete reservations.</p>
              <Link to="/admin/reservations/list" className="btn btn-primary">
                Go to Reservations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
