import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../lib/api";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function buildInitialForm() {
  return {
    resourceId: "",
    bookingDate: getToday(),
    startTime: "09:00",
    endTime: "10:00",
    purpose: "",
    expectedAttendees: 1
  };
}

export default function BookingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [form, setForm] = useState(buildInitialForm());
  const [reviewReason, setReviewReason] = useState({});
  const [editingBookingId, setEditingBookingId] = useState("");

  const bookingEndpoint = useMemo(() => {
    return statusFilter ? `/api/bookings?status=${statusFilter}` : "/api/bookings";
  }, [statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [bookingEndpoint, user]);

  useEffect(() => {
    loadResources();
  }, [user]);

  async function loadBookings() {
    try {
      setLoading(true);
      const payload = await apiGet(bookingEndpoint, user);
      setBookings(Array.isArray(payload) ? payload : []);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadResources() {
    try {
      setResourcesLoading(true);
      const payload = await apiGet(
        "/api/resources?status=ACTIVE&page=0&size=100&sortBy=name&sortOrder=ASC",
        user
      );
      setResources(payload.content ?? []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setResourcesLoading(false);
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: field === "expectedAttendees" ? Number(value) : value
    }));
  }

  async function handleCreateBooking(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      setSubmitting(true);
      if (editingBookingId) {
        await apiPut(`/api/bookings/${editingBookingId}`, {
          bookingDate: form.bookingDate,
          startTime: form.startTime,
          endTime: form.endTime,
          purpose: form.purpose,
          expectedAttendees: form.expectedAttendees
        }, user);
        setMessage("Booking updated successfully.");
      } else {
        await apiPost("/api/bookings", form, user);
        setMessage("Booking request submitted successfully.");
      }
      setForm(buildInitialForm());
      setEditingBookingId("");
      await loadBookings();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleEditClick(booking) {
    setForm({
      resourceId: booking.resourceId,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      expectedAttendees: booking.expectedAttendees
    });
    setEditingBookingId(booking.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setForm(buildInitialForm());
    setEditingBookingId("");
  }

  async function handleDeleteBooking(bookingId) {
    const confirmed = window.confirm("Are you sure you want to completely delete this booking?");
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await apiDelete(`/api/bookings/${bookingId}`, user);
      setMessage("Booking deleted successfully.");
      await loadBookings();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleReview(bookingId, decision) {
    try {
      setError("");
      setMessage("");
      await apiPatch(`/api/bookings/${bookingId}/review`, {
        decision,
        reason: reviewReason[bookingId] ?? ""
      }, user);

      setMessage(`Booking ${decision.toLowerCase()} successfully.`);
      await loadBookings();
    } catch (reviewError) {
      setError(reviewError.message);
    }
  }

  async function handleCancel(bookingId) {
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await apiPatch(`/api/bookings/${bookingId}/cancel`, {}, user);
      setMessage("Booking cancelled successfully.");
      await loadBookings();
    } catch (cancelError) {
      setError(cancelError.message);
    }
  }

  function canCancel(status) {
    return status === "PENDING" || status === "APPROVED";
  }

  return (
    <section>
      <PageHeader
        eyebrow=""
        title="Booking management"
        description="Create booking requests, track approval status, and manage the full booking workflow."
      />

      <div className="vertical-stack">
        <div className="booking-panel" style={{ maxWidth: "1200px", margin: "0 auto 2rem" }}>
          <h3 style={{ marginBottom: "1.5rem", textAlign: "center" }}>{editingBookingId ? "Edit booking request" : "Create booking request"}</h3>

          <form className="booking-form" onSubmit={handleCreateBooking}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "1rem" }}>
              <label className="field">
                <span>Resource</span>
                <select
                  value={form.resourceId}
                  onChange={(event) => updateForm("resourceId", event.target.value)}
                  disabled={!!editingBookingId}
                  required
                >
                  <option value="">Select a resource</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} - {resource.location}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Date</span>
                <input
                  type="date"
                  min={getToday()}
                  value={form.bookingDate}
                  onChange={(event) => updateForm("bookingDate", event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>Expected attendees</span>
                <input
                  type="number"
                  min="1"
                  value={form.expectedAttendees}
                  onChange={(event) => updateForm("expectedAttendees", event.target.value)}
                  required
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: "1rem", alignItems: "flex-end" }}>
              <label className="field">
                <span>Start time</span>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(event) => updateForm("startTime", event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>End time</span>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(event) => updateForm("endTime", event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>Purpose</span>
                <input
                  className="booking-review-textarea"
                  style={{ minHeight: "44px", padding: "0.5rem 1rem" }}
                  value={form.purpose}
                  onChange={(event) => updateForm("purpose", event.target.value)}
                  placeholder="Reason for booking"
                  required
                />
              </label>

              <div className="action-row" style={{ marginTop: 0 }}>
                <button type="submit" className="primary-button" style={{ width: "auto", marginTop: 0, padding: "0.8rem 1.5rem" }} disabled={submitting || resourcesLoading}>
                  {submitting ? "..." : editingBookingId ? "Update" : "Submit Request"}
                </button>
                {editingBookingId ? (
                  <button type="button" className="secondary-button" style={{ width: "auto", marginTop: 0, padding: "0.8rem 1rem" }} onClick={handleCancelEdit}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          </form>
        </div>

        <div className="booking-panel" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div className="booking-toolbar" style={{ flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1.5rem" }}>
            <h3>{isAdmin ? "All booking requests" : "My booking requests"}</h3>

            <div className="tab-container" style={{ display: "flex", justifyContent: "center", gap: "1rem", borderBottom: "1px solid var(--border)", width: "100%", paddingBottom: "0.5rem" }}>
              {[
                { id: "", label: "All" },
                { id: "PENDING", label: "Pending" },
                { id: "APPROVED", label: "Approved" },
                { id: "CANCELLED", label: "Cancelled" },
                { id: "REJECTED", label: "Rejected" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`nav-link ${statusFilter === tab.id ? "nav-link-active" : ""}`}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem 1rem" }}
                  onClick={() => setStatusFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {message ? <p className="form-message">{message}</p> : null}
          {loading && <p className="state-text">Loading bookings...</p>}
          {error && <p className="state-text state-error">{error}</p>}

          <div className="stack-list">
            {bookings.length === 0 && !loading ? (
              <p className="state-text">No bookings found.</p>
            ) : null}

            {bookings.map((booking) => (
              <article key={booking.id} className="stack-card booking-card">
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

                <div className="booking-actions">
                  <div className="action-row" style={{ alignItems: "flex-end" }}>
                    {isAdmin && booking.status === "PENDING" ? (
                      <div className="field" style={{ flex: 1, minWidth: "280px" }}>
                        <span>Review reason</span>
                        <textarea
                          className="booking-review-textarea"
                          placeholder="Optional review reason"
                          style={{ minHeight: "60px" }}
                          value={reviewReason[booking.id] ?? ""}
                          onChange={(event) =>
                            setReviewReason((current) => ({
                              ...current,
                              [booking.id]: event.target.value
                            }))
                          }
                        />
                      </div>
                    ) : null}

                    <div className="action-row" style={{ marginTop: 0 }}>
                      {isAdmin && booking.status === "PENDING" ? (
                        <>
                          <button
                            type="button"
                            className="primary-button"
                            style={{ width: "auto", marginTop: 0 }}
                            onClick={() => handleReview(booking.id, "APPROVED")}
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            className="danger-button"
                            style={{ width: "auto", marginTop: 0 }}
                            onClick={() => handleReview(booking.id, "REJECTED")}
                          >
                            Reject
                          </button>
                        </>
                      ) : null}

                      {canCancel(booking.status) ? (
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ width: "auto", marginTop: 0 }}
                          onClick={() => handleCancel(booking.id)}
                        >
                          Cancel
                        </button>
                      ) : null}

                      {!isAdmin && booking.status === "PENDING" ? (
                        <>
                          <button
                            type="button"
                            className="secondary-button"
                            style={{ width: "auto", marginTop: 0 }}
                            onClick={() => handleEditClick(booking)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger-button"
                            style={{ width: "auto", marginTop: 0 }}
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}