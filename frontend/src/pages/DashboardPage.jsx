import InfoCard from "../components/InfoCard";
import PageHeader from "../components/PageHeader";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const resources = useApi("/api/resources");
  const bookings = useApi("/api/bookings");
  const tickets = useApi("/api/tickets");
  const notifications = useApi("/api/notifications");

  const stats = [
    {
      label: "Active Bookings",
      value: bookings.loading ? "..." : bookings.data.filter(b => b.status === "APPROVED").length,
      tone: "accent"
    },
    {
      label: "Open Tickets",
      value: tickets.loading ? "..." : tickets.data.filter(t => t.status !== "RESOLVED").length,
      tone: "warm"
    },
    {
      label: "Notifications",
      value: notifications.loading ? "..." : notifications.data.filter(n => !n.read).length,
      tone: "cool"
    }
  ];

  return (
    <section className="dashboard-view">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${user?.firstName || "User"}`}
        description="Monitor your campus resources, check ticket status, and stay updated with recent activity."
      />

      <div className="card-grid" style={{ marginBottom: "2.5rem" }}>
        {stats.map((stat) => (
          <InfoCard key={stat.label} {...stat} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
        <div className="data-card" style={{ padding: "2rem" }}>
          <h3 style={{ marginBottom: "1.2rem", fontSize: "1.25rem" }}>System Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
              <span style={{ color: "var(--text-soft)" }}>Resource Registry</span>
              <span className="badge badge-success">Online</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
              <span style={{ color: "var(--text-soft)" }}>Ticketing System</span>
              <span className="badge badge-success">Operational</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
              <span style={{ color: "var(--text-soft)" }}>Notification Engine</span>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>

        <div className="data-card" style={{ padding: "2rem", position: "relative", overflow: "hidden" }}>
          <h3 style={{ marginBottom: "1.2rem", fontSize: "1.25rem" }}>Recent Activity</h3>
          {notifications.loading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading activity...</p>
          ) : notifications.data.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {notifications.data.slice(0, 3).map((n, i) => (
                <div key={n.id || i} style={{ paddingLeft: "1rem", borderLeft: "2px solid var(--accent-strong)" }}>
                  <p style={{ margin: 0, fontWeight: 500 }}>{n.title}</p>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-soft)" }}>{n.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>No recent activity to show.</p>
          )}
          
          <div style={{ 
            position: "absolute", 
            bottom: "-10%", 
            right: "-5%", 
            width: "120px", 
            height: "120px", 
            background: "radial-gradient(circle, var(--accent-bg) 0%, transparent 70%)", 
            borderRadius: "50%",
            zIndex: 0
          }}></div>
        </div>
      </div>
    </section>
  );
}
