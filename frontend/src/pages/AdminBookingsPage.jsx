import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../auth/AuthContext";
import { apiGet, apiPatch } from "../lib/api";

export default function AdminBookingsPage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewReason, setReviewReason] = useState({});

  const endpoint = useMemo(() => {
    return statusFilter ? `/api/bookings?status=${statusFilter}` : "/api/bookings";
  }, [statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [endpoint]);

  async function loadBookings() {
    try {
      setLoading(true);
      const payload = await apiGet(endpoint, user);
      setBookings(Array.isArray(payload) ? payload : []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(bookingId, decision) {
    try {
      setError("");
      setMessage("");

      await apiPatch(
        `/api/bookings/${bookingId}/review`,
        {
          decision,
          reason: reviewReason[bookingId] ?? ""
        },
        user
      );

      setMessage(`Booking ${decision.toLowerCase()} successfully.`);
      await loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(bookingId) {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await apiPatch(`/api/bookings/${bookingId}/cancel`, undefined, user);

      setMessage("Booking cancelled successfully.");
      await loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <PageHeader
        eyebrow=""
        title="Admin booking approvals"
        description="Review pending booking requests, approve or reject them, and manage booking status."
      />

      <div className="admin-bookings-toolbar">
        <label className="field admin-bookings-filter">
          <span>Status filter</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>
      </div>

      {message ? <p className="form-message form-message-success">{message}</p> : null}
      {error ? <p className="form-message form-message-error">{error}</p> : null}
      {loading ? <p className="state-text">Loading bookings...</p> : null}

      <div className="stack-list">
        {!loading && bookings.length === 0 ? (
          <p className="state-text">No bookings found.</p>
        ) : null}

        {bookings.map((booking) => (
          <article key={booking.id} className="stack-card admin-booking-card">
            <div className="stack-head">
              <div>
                <h3>{booking.resourceName}</h3>
                <p>
                  {booking.bookingDate} | {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <StatusBadge value={booking.status} />
            </div>

            <p className="stack-copy">{booking.purpose}</p>

            <div className="stack-meta">
              <span>Requester: {booking.requesterName}</span>
              <span>Attendees: {booking.expectedAttendees}</span>
              <span>Reviewed by: {booking.reviewedBy ?? "Not reviewed yet"}</span>
            </div>

            {booking.decisionReason ? (
              <p className="booking-reason">
                <strong>Reason:</strong> {booking.decisionReason}
              </p>
            ) : null}

            {booking.status === "PENDING" ? (
              <div className="admin-booking-actions">
                <label className="field">
                  <span>Review reason</span>
                  <textarea
                    className="booking-review-textarea"
                    placeholder="Optional reason for approval or rejection"
                    value={reviewReason[booking.id] ?? ""}
                    onChange={(event) =>
                      setReviewReason((current) => ({
                        ...current,
                        [booking.id]: event.target.value
                      }))
                    }
                  />
                </label>

                <div className="admin-booking-button-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleReview(booking.id, "APPROVED")}
                  >
                    Approve
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleReview(booking.id, "REJECTED")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : null}

            {(booking.status === "PENDING" || booking.status === "APPROVED") ? (
              <div className="admin-booking-cancel-row">
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleCancel(booking.id)}
                >
                  Cancel booking
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}