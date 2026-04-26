import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../auth/AuthContext";
import { apiGet, apiPatch } from "../lib/api";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("bookings"); // "bookings", "tickets", or "analytics"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reviewReason, setReviewReason] = useState({});
  const [stats, setStats] = useState({
    mostBooked: [],
    priorityDist: {}
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      if (activeTab === "bookings") {
        const payload = await apiGet("/api/bookings?status=PENDING", user);
        setBookings(Array.isArray(payload) ? payload : []);
      } else if (activeTab === "tickets") {
        const payload = await apiGet("/api/tickets", user);
        setTickets(Array.isArray(payload) ? payload.filter(t => t.status === "OPEN") : []);
      } else if (activeTab === "analytics") {
        const [allBookings, allTickets] = await Promise.all([
          apiGet("/api/bookings", user),
          apiGet("/api/tickets", user)
        ]);

        // Calculate analytics
        const counts = {};
        allBookings.forEach(b => {
          counts[b.resourceName] = (counts[b.resourceName] || 0) + 1;
        });
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        const pDist = {};
        allTickets.forEach(t => {
          pDist[t.priority] = (pDist[t.priority] || 0) + 1;
        });

        setStats({ mostBooked: sorted, priorityDist: pDist });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBookingReview(bookingId, decision) {
    try {
      setError("");
      setMessage("");
      await apiPatch(`/api/bookings/${bookingId}/review`, {
        decision,
        reason: reviewReason[bookingId] ?? ""
      }, user);
      setMessage(`Booking ${decision.toLowerCase()} successfully.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleTicketStatus(ticketId, status) {
    try {
      setError("");
      setMessage("");
      await apiPatch(`/api/tickets/${ticketId}/status`, {
        status,
        resolutionNotes: "Reviewed by Admin"
      }, user);
      setMessage(`Ticket status updated to ${status.toLowerCase()}.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="dashboard-view" style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      <PageHeader
        title="Admin Dashboard"
        description="Review requests, manage tickets, and monitor system-wide usage analytics."
      />

      <div className="tab-container" style={{ 
        marginBottom: "2.5rem", 
        display: "flex", 
        justifyContent: "center",
        gap: "1.5rem", 
        borderBottom: "1px solid var(--border)", 
        paddingBottom: "1rem",
        flexWrap: "wrap"
      }}>
        <button 
          className={`nav-link ${activeTab === "bookings" ? "nav-link-active" : ""}`}
          onClick={() => setActiveTab("bookings")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}
        >
          Pending Bookings ({bookings.length})
        </button>
        <button 
          className={`nav-link ${activeTab === "tickets" ? "nav-link-active" : ""}`}
          onClick={() => setActiveTab("tickets")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}
        >
          Open Tickets ({tickets.length})
        </button>
        <button 
          className={`nav-link ${activeTab === "analytics" ? "nav-link-active" : ""}`}
          onClick={() => setActiveTab("analytics")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}
        >
          System Analytics
        </button>
      </div>

      {message ? <p className="form-message form-message-success" style={{ textAlign: "center" }}>{message}</p> : null}
      {error ? <p className="form-message form-message-error" style={{ textAlign: "center" }}>{error}</p> : null}
      
      {loading ? (
        <p className="state-text">Loading workspace...</p>
      ) : activeTab === "bookings" ? (
        <div className="stack-list">
          {bookings.length === 0 && <p className="state-text">No pending bookings.</p>}
          {bookings.map((booking) => (
            <article key={booking.id} className="stack-card">
              <div className="stack-head">
                <div>
                  <h3>{booking.resourceName}</h3>
                  <p>{booking.bookingDate} | {booking.startTime} - {booking.endTime}</p>
                </div>
                <StatusBadge value={booking.status} />
              </div>
              <p className="stack-copy">{booking.purpose}</p>
              <div className="stack-meta">
                <span>Requester: {booking.requesterName}</span>
                <span>Attendees: {booking.expectedAttendees}</span>
              </div>
              
              <div className="admin-booking-actions" style={{ marginTop: "1.5rem" }}>
                <textarea
                  className="booking-review-textarea"
                  placeholder="Optional review reason..."
                  value={reviewReason[booking.id] ?? ""}
                  onChange={(e) => setReviewReason({...reviewReason, [booking.id]: e.target.value})}
                />
                <div className="action-row" style={{ marginTop: "1rem" }}>
                  <button className="primary-button" style={{ width: "auto", marginTop: 0 }} onClick={() => handleBookingReview(booking.id, "APPROVED")}>Approve</button>
                  <button className="danger-button" style={{ width: "auto", marginTop: 0 }} onClick={() => handleBookingReview(booking.id, "REJECTED")}>Reject</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : activeTab === "tickets" ? (
        <div className="stack-list">
          {tickets.length === 0 && <p className="state-text">No open tickets.</p>}
          {tickets.map((ticket) => (
            <article key={ticket.id} className="stack-card">
              <div className="stack-head">
                <div>
                  <h3>{ticket.category}</h3>
                  <p>{ticket.location}</p>
                </div>
                <StatusBadge value={ticket.status} />
              </div>
              <p className="stack-copy">{ticket.description}</p>
              <div className="stack-meta">
                <span>Priority: {ticket.priority}</span>
                <span>Reporter: {ticket.reporterName}</span>
              </div>
              
              <div className="action-row" style={{ marginTop: "1.5rem" }}>
                <button className="primary-button" style={{ width: "auto", marginTop: 0 }} onClick={() => handleTicketStatus(ticket.id, "IN_PROGRESS")}>Accept Ticket</button>
                <button className="danger-button" style={{ width: "auto", marginTop: 0 }} onClick={() => handleTicketStatus(ticket.id, "REJECTED")}>Reject Ticket</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="analytics-view" style={{ display: "grid", gap: "2rem" }}>
          <div className="data-card" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>Most Booked Resources</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {stats.mostBooked.map(([name, count]) => (
                <div key={name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span>{name}</span>
                    <span style={{ fontWeight: 600 }}>{count} bookings</span>
                  </div>
                  <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "var(--accent-strong)", width: `${Math.min(100, (count / stats.mostBooked[0][1]) * 100)}%` }}></div>
                  </div>
                </div>
              ))}
              {stats.mostBooked.length === 0 && <p className="state-text">No booking data available yet.</p>}
            </div>
          </div>

          <div className="data-card" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>Ticket Priority Distribution</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(p => (
                <div key={p} style={{ padding: "1.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "16px", textAlign: "center", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-soft)", marginBottom: "0.5rem" }}>{p}</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: p === "CRITICAL" ? "var(--danger)" : "inherit" }}>
                    {stats.priorityDist[p] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}