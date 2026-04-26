import { Suspense, lazy, useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const TicketsPage = lazy(() => import("./pages/TicketsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const OAuthSuccessPage = lazy(() => import("./pages/OAuthSuccessPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const saved = window.localStorage.getItem("paf:sidebar-open");
    if (saved !== null) {
      setSidebarOpen(saved === "1");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("paf:sidebar-open", sidebarOpen ? "1" : "0");
  }, [sidebarOpen]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" aria-hidden="true" />
        <p>Loading your workspace...</p>
      </div>
    );
  }

  const navItems = [
    { to: "/dashboard", label: "Overview" },
    { to: "/resources", label: "Resources" },
    { to: "/bookings", label: "Bookings" },
    { to: "/tickets", label: "Jobs" },
    { to: "/notifications", label: "Notifications" },
    ...(user?.role === "ADMIN"
      ? [{ to: "/admin/dashboard", label: "Admin Dashboard" }]
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
      <Suspense fallback={<div className="route-loader">Loading page...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/oauth-success" element={<OAuthSuccessPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Redirect unauthenticated users trying to access protected routes to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`shell ${sidebarOpen ? "shell-sidebar-open" : "shell-sidebar-closed"}`}>
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
      </aside>

      <main className="content" aria-live="polite">
        <div className="content-toolbar">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((current) => !current)}
            aria-label={sidebarOpen ? "Hide navigation menu" : "Show navigation menu"}
          >
            {sidebarOpen ? "Hide menu" : "Menu"}
          </button>

          <div className="toolbar-actions">
            <Link to="/profile" className="profile-icon-button" aria-label="Open profile page" style={{ padding: 0, overflow: "hidden" }}>
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <span>{user?.firstName?.[0] ?? "U"}</span>
              )}
            </Link>
            <button type="button" className="logout-button toolbar-logout" onClick={logout}>
              Log out
            </button>
          </div>
        </div>

        <Suspense fallback={<div className="route-loader">Loading page...</div>}>
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
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
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
        </Suspense>
      </main>
    </div>
  );
}