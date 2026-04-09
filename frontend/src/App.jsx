import { useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import ResourcesPage from "./pages/ResourcesPage";
import BookingsPage from "./pages/BookingsPage";
import TicketsPage from "./pages/TicketsPage";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/resources", label: "Resources" },
  { to: "/bookings", label: "Bookings" },
  { to: "/tickets", label: "Tickets" },
  { to: "/notifications", label: "Notifications" }
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  if (isAuthPage) {
    return (
      <main className="auth-shell">
        <div className="auth-backdrop" />
        <div className="auth-topbar">
          <Link to="/login" className="auth-brand">
            Smart Campus Hub
          </Link>
        </div>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className={`shell ${sidebarOpen ? "shell-sidebar-open" : "shell-sidebar-closed"}`}>
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="brand">
          <h1>Smart Campus Hub</h1>
          <p className="brand-copy">
            Facilities, bookings, maintenance, and notifications in one place.
          </p>
          {user ? (
            <div className="sidebar-user">
              <strong>{user.displayName}</strong>
              <span>{user.studentId}</span>
              <span>{user.role}</span>
            </div>
          ) : null}
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
              onClick={() => {
                if (window.innerWidth <= 920) {
                  setSidebarOpen(false);
                }
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="logout-button" onClick={logout}>
          Log out
        </button>
      </aside>

      <main className="content">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((current) => !current)}
        >
          {sidebarOpen ? "Hide menu" : "Show menu"}
        </button>

        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <TicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </main>
    </div>
  );
}
