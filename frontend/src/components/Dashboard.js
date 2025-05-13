import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const Dashboard = ({ role }) => {
  useEffect(() => {
    document.title = `LFKG Cinemas | ${
      role === "admin" ? "Admin" : "Employee"
    } Dashboard`;
  }, [role]);

  const cards = [
    {
      title: "Manage Users",
      text: "View and manage user accounts.",
      link: "/users-list",
      roles: ["admin"],
    },
    {
      title: "Manage Movies",
      text: "Add, edit, or delete movies.",
      link: "/admin/movies/list",
      roles: ["admin", "employee"],
    },
    {
      title: "Manage Halls",
      text: "Add, edit, or delete cinema halls.",
      link: "/admin/halls/list",
      roles: ["admin"],
    },
    {
      title: "Manage Shows",
      text: "Add, edit, or delete shows.",
      link: "/admin/shows/list",
      roles: ["admin", "employee"],
    },
    {
      title: "Manage Reservations",
      text: "Add, edit, or delete reservations.",
      link: "/admin/reservations/list",
      roles: ["admin", "employee"],
    },
  ];

  return (
    <div className="container mt-5 mb-5">
      <h1 className="text-center mb-4">
        {role === "admin" ? "Admin" : "Employee"} Dashboard
      </h1>
      <div className="row g-4">
        {cards
          .filter((card) => card.roles.includes(role))
          .map((card) => (
            <div className="col-md-4" key={card.link}>
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <h5 className="card-title">{card.title}</h5>
                  <p className="card-text">{card.text}</p>
                  <Link to={card.link} className="btn btn-primary">
                    Go to {card.title.split(" ")[1]}
                  </Link>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
