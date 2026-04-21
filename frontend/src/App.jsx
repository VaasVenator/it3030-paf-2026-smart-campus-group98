import { useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import ResourcesPage from "./pages/ResourcesPage";
import BookingsPage from "./pages/BookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import TicketsPage from "./pages/TicketsPage";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import OAuthSuccessPage from "./pages/OAuthSuccessPage";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  const navItems = [
    { to: "/dashboard", label: "Overview" },
    { to: "/resources", label: "Resources" },
    { to: "/bookings", label: "Bookings" },
    { to: "/tickets", label: "Tickets" },
    { to: "/notifications", label: "Notifications" },
    ...(user?.role === "ADMIN"
      ? [{ to: "/admin/bookings", label: "Admin Bookings" }]
      : [])
  ];

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/oauth-success";

  const isPublicPage = 
    location.pathname === "/" ||
    location.pathname === "/about" ||
    location.pathname === "/contact";

  // Show public pages (including auth pages) if not authenticated
  if (!user && (isAuthPage || isPublicPage)) {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/oauth-success" element={<OAuthSuccessPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Redirect unauthenticated users trying to access protected routes to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`shell ${sidebarOpen ? "shell-sidebar-open" : "shell-sidebar-closed"}`}>
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="brand">
          <h1>Smart Campus Hub</h1>
          <p className="brand-copy">
            Facilities, bookings, maintenance, and notifications in one place.
          </p>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
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
        <div className="content-toolbar">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((current) => !current)}
          >
            {sidebarOpen ? "Hide menu" : "Menu"}
          </button>

          <div className="toolbar-actions">
            <Link to="/profile" className="profile-icon-button" aria-label="Open profile page">
              <span>{user?.firstName?.[0] ?? "U"}</span>
            </Link>
            <button type="button" className="logout-button toolbar-logout" onClick={logout}>
              Log out
            </button>
          </div>
        </div>

        <Routes>
          <Route
            path="/dashboard"
            element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
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
            path="/admin/bookings"
            element={
              <ProtectedRoute>
                <AdminBookingsPage />
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/oauth-success" element={<OAuthSuccessPage />} />
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}