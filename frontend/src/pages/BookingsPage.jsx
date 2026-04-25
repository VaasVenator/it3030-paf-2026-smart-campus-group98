import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { apiGet, apiPatch, apiPost } from "../lib/api";

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
      await apiPost("/api/bookings", form, user);
      setMessage("Booking request submitted successfully.");
      setForm(buildInitialForm());
      await loadBookings();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSubmitting(false);
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

      <div className={`booking-layout ${isAdmin ? "booking-layout-fullwidth" : ""}`}>
        {!isAdmin ? (
          <div className="booking-panel">
            <h3>Create booking request</h3>

            <form className="booking-form" onSubmit={handleCreateBooking}>
              <label className="field">
                <span>Resource</span>
                <select
                  value={form.resourceId}
                  onChange={(event) => updateForm("resourceId", event.target.value)}
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

              <div className="field-grid two-columns">
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

              <div className="field-grid two-columns">
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
              </div>

              <label className="field">
                <span>Purpose</span>
                <textarea
                  className="booking-textarea"
                  value={form.purpose}
                  onChange={(event) => updateForm("purpose", event.target.value)}
                  placeholder="Why do you need this resource?"
                  required
                />
              </label>

              <button type="submit" className="primary-button" disabled={submitting || resourcesLoading}>
                {submitting ? "Submitting..." : "Submit booking"}
              </button>
            </form>
          </div>
        ) : null}

        <div className="booking-panel booking-panel-wide">
          <div className="booking-toolbar">
            <h3>{isAdmin ? "All booking requests" : "My booking requests"}</h3>

            <label className="field booking-filter">
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

          {message ? <p className="form-message">{message}</p> : null}
          {loading && <p className="state-text">Loading bookings...</p>}
          {error && <p className="state-text state-error">{error}</p>}

          {bookings.length === 0 && !loading ? (
            <p className="state-text">No bookings found.</p>
          ) : null}

          {bookings.length > 0 && (
            <div className="bookings-table-wrapper">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Date & Time</th>
                    <th>Purpose</th>
                    <th>Attendees</th>
                    <th>Requester</th>
                    <th>Reviewed By</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="booking-row">
                      <td>{booking.resourceName}</td>
                      <td>{booking.bookingDate} {booking.startTime} - {booking.endTime}</td>
                      <td>{booking.purpose}</td>
                      <td>{booking.expectedAttendees}</td>
                      <td>{booking.requesterName}</td>
                      <td>{booking.reviewedBy ?? "Not reviewed"}</td>
                      <td>{booking.decisionReason ?? "-"}</td>
                      <td><StatusBadge value={booking.status} /></td>
                      <td className="booking-actions-cell">
                        {isAdmin && booking.status === "PENDING" ? (
                          <div className="booking-controls">
                            <textarea
                              className="booking-textarea-inline"
                              placeholder="Optional reason"
                              value={reviewReason[booking.id] ?? ""}
                              onChange={(event) =>
                                setReviewReason((current) => ({
                                  ...current,
                                  [booking.id]: event.target.value
                                }))
                              }
                            />
                            <div className="booking-button-group">
                              <button
                                type="button"
                                className="primary-button"
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

                        {canCancel(booking.status) ? (
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => handleCancel(booking.id)}
                          >
                            Cancel
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}