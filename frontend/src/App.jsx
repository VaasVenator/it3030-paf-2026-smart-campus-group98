import { useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ResourcesPage from "./pages/ResourcesPage";
import BookingsPage from "./pages/BookingsPage";
import TicketsPage from "./pages/TicketsPage";
import NotificationsPage from "./pages/NotificationsPage";

const navItems = [
  { to: "/", label: "Overview" },
  { to: "/resources", label: "Resources" },
  { to: "/bookings", label: "Bookings" },
  { to: "/tickets", label: "Tickets" },
  { to: "/notifications", label: "Notifications" }
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
          <Route path="/" element={<DashboardPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
      </main>
    </div>
  );
}
