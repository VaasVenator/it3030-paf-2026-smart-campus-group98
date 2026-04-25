import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../auth/AuthContext";
import { apiGet, apiPatch } from "../lib/api";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" or "tickets"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reviewReason, setReviewReason] = useState({});

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
      } else {
        const payload = await apiGet("/api/tickets", user);
        setTickets(Array.isArray(payload) ? payload.filter(t => t.status === "OPEN") : []);
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
        eyebrow="Admin Portal"
        title="Admin Dashboard"
        description="Review and approve pending booking requests and maintenance tickets."
      />

      <div className="tab-container" style={{ 
        marginBottom: "2.5rem", 
        display: "flex", 
        justifyContent: "center",
        gap: "2rem", 
        borderBottom: "1px solid var(--border)", 
        paddingBottom: "1rem" 
      }}>
        <button 
          className={`nav-link ${activeTab === "bookings" ? "nav-link-active" : ""}`}
          onClick={() => setActiveTab("bookings")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
        >
          Pending Bookings ({bookings.length})
        </button>
        <button 
          className={`nav-link ${activeTab === "tickets" ? "nav-link-active" : ""}`}
          onClick={() => setActiveTab("tickets")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}
        >
          Open Tickets ({tickets.length})
        </button>
      </div>

      {message ? <p className="form-message form-message-success" style={{ textAlign: "center" }}>{message}</p> : null}
      {error ? <p className="form-message form-message-error" style={{ textAlign: "center" }}>{error}</p> : null}
      
      {loading ? (
        <p className="state-text">Loading items...</p>
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
      ) : (
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
      )}
    </section>
  );
}