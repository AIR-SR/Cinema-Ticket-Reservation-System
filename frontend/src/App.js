import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Styles
import "./styles/modal.css";

// Contexts
import { UserProvider } from "./context/UserContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// User Pages
import Homepage from "./pages/user/Homepage";
import Login from "./pages/user/Login";
import Logout from "./pages/user/Logout";
import Register from "./pages/user/Register";
import MyProfile from "./pages/user/MyProfile";
import CinemaPage from "./pages/user/CinemaPage";
import MovieDetails from "./pages/user/MovieDetails";
import BookTicketPage from "./pages/user/BookTicketPage";
import ReservationsUserList from "./pages/user/ReservationsUserList";
import ReservationDetails from "./pages/user/ReservationDetails";
import PaymentPage from "./pages/user/PaymentPage";

// Admin Pages
import RegisterAdmin from "./pages/admin/RegisterAdmin";
import UserList from "./pages/admin/UserList";
import UserDetails from "./pages/admin/UserDetails";
import MovieListAdmin from "./pages/admin/MovieListAdmin";
import MovieAddAdmin from "./pages/admin/MovieAddAdmin";
import HallListAdmin from "./pages/admin/HallListAdmin";
import HallAddAdmin from "./pages/admin/HallAddAdmin";
import HallDetailsAdmin from "./pages/admin/HallDetailsAdmin";
import ShowListAdmin from "./pages/admin/ShowListAdmin";
import ShowAddAdmin from "./pages/admin/ShowAddAdmin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeDashboard from "./pages/admin/EmployeeDashboard";
import ReservationListAdmin from "./pages/admin/ReservationListAdmin";
import ReservationUserDetails from "./pages/admin/ReservationUserDetails";
import CreateReservationForUser from "./pages/admin/CreateReservationforUser";
import PaymetListAdmin from "./pages/admin/PaymetListAdmin";

// Misc Pages
import HealthCheck from "./pages/HealthCheck";

const PrivateRoute = ({ element, requiredRole }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  try {
    const decodedToken = jwtDecode(token);
    const { role, exp } = decodedToken;

    // Check if the token is expired
    if (Date.now() >= exp * 1000) {
      localStorage.removeItem("token");
      return <Navigate to="/login" />;
    }

    // Check if the user's role is authorized
    if (
      Array.isArray(requiredRole)
        ? requiredRole.includes(role)
        : role === requiredRole
    ) {
      return element;
    }

    return <Navigate to="/" />;
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
};

const App = () => {
  const [, setToken] = useState(localStorage.getItem("token"));

  return (
    <UserProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Health Check */}
              <Route path="/health-check" element={<HealthCheck />} />

              {/* Public Routes */}
              <Route path="/" element={<Homepage />} />
              <Route path="/cinema/:city" element={<CinemaPage />} />
              <Route path="/login" element={<Login setToken={setToken} />} />
              <Route path="/logout" element={<Logout setToken={setToken} />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/movies/details/:movieId"
                element={<MovieDetails />}
              />

              {/* User Routes */}
              <Route
                path="/users/myprofile"
                element={
                  <PrivateRoute
                    element={<MyProfile />}
                    requiredRole={["admin", "employee", "user"]}
                  />
                }
              />
              <Route
                path="/users/reservations"
                element={
                  <PrivateRoute
                    element={<ReservationsUserList />}
                    requiredRole={["admin", "employee", "user"]}
                  />
                }
              />
              <Route
                path="/users/reservations/:reservationId"
                element={
                  <PrivateRoute
                    element={<ReservationDetails />}
                    requiredRole={["admin", "employee", "user"]}
                  />
                }
              />
              <Route
                path="/book-ticket/:showId"
                element={
                  <PrivateRoute
                    element={<BookTicketPage />}
                    requiredRole={["admin", "employee", "user"]}
                  />
                }
              />
              <Route
                path="/payment/:reservationId"
                element={
                  <PrivateRoute
                    element={<PaymentPage />}
                    requiredRole={["admin", "employee", "user"]}
                  />
                }
              />

              {/* Admin Routes */}
              <Route
                path="/register/admin"
                element={
                  <PrivateRoute
                    element={<RegisterAdmin />}
                    requiredRole={["admin"]}
                  />
                }
              />
              <Route
                path="/users-list"
                element={
                  <PrivateRoute
                    element={<UserList />}
                    requiredRole={["admin"]}
                  />
                }
              />
              <Route
                path="/users/details/:userId"
                element={
                  <PrivateRoute
                    element={<UserDetails />}
                    requiredRole={["admin"]}
                  />
                }
              />
              <Route
                path="/admin/movies/list"
                element={
                  <PrivateRoute
                    element={<MovieListAdmin />}
                    requiredRole={["admin", "employee"]}
                  />
                }
              />
              <Route
                path="/admin/movies/add"
                element={
                  <PrivateRoute
                    element={<MovieAddAdmin />}
                    requiredRole={["admin", "employee"]}
                  />
                }
              />
              <Route
                path="/admin/halls/list"
                element={
                  <PrivateRoute
                    element={<HallListAdmin />}
                    requiredRole={["admin"]}
                  />
                }
              />
              <Route
                path="/admin/halls/add"
                element={
                  <PrivateRoute
                    element={<HallAddAdmin />}
                    requiredRole={["admin"]}
                  />
                }
              />
              <Route
                path="/admin/halls/details/:hallId"
                element={
                  <PrivateRoute
                    element={<HallDetailsAdmin />}
                    requiredRole={["admin", "employee"]}
                  />
                }
              />
              <Route
                path="/admin/shows/list"
                element={
                  <PrivateRoute
                    element={<ShowListAdmin />}
                    requiredRole={["admin", "employee"]}
                  />
                }
              />
              <Route
                path="/admin/shows/add"
                element={
                  <PrivateRoute
                    element={<ShowAddAdmin />}
                    requiredRole={["admin", "employee"]}
                  />
                }
              />
              <Route
                path="/admin/payments/list"
                element={
                  <PrivateRoute
                    element={<PaymetListAdmin />}
                    requiredRole={["admin", "employee"]}
                  />
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute
                    element={<AdminDashboard />}
                    requiredRole={["admin"]}
                  />
                }
              />
              <Route
                path="/employee/dashboard"
                element={
                  <PrivateRoute
                    element={<EmployeeDashboard />}
                    requiredRole={["employee"]}
                  />
                }
              />
              <Route
                path="/admin/reservations/list"
                element={
                  <PrivateRoute
                    element={<ReservationListAdmin />}
                    requiredRole={["admin", "employee"]}
                  />
                }
              />
              <Route
                path="/admin/reservations/user/:userId/details/:reservationId"
                element={
                  <PrivateRoute
                    element={<ReservationUserDetails />}
                    requiredRole={["admin", "employee"]}
                  />
                }
              />
              <Route
                path="/admin/reservations/user/:userId/create"
                element={
                  <PrivateRoute
                    element={<CreateReservationForUser />}
                    requiredRole={["admin", "employee"]}
                  />
                }
              />
              <Route
                path="/admin/reservations/create"
                element={
                  <PrivateRoute
                    element={<CreateReservationForUser />}
                    requiredRole={["admin", "employee"]}
                  />
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
