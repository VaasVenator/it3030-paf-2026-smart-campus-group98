import { useState } from "react";

export default function BookingEditForm({
  booking,
  onCancel,
  onSubmit,
  loading
}) {
  const [form, setForm] = useState({
    bookingDate: booking.bookingDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    purpose: booking.purpose,
    expectedAttendees: booking.expectedAttendees
  });
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.bookingDate) {
      setError("Booking date is required.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError("Start and end times are required.");
      return;
    }

    if (form.startTime >= form.endTime) {
      setError("Start time must be before end time.");
      return;
    }

    if (!form.purpose.trim()) {
      setError("Purpose is required.");
      return;
    }

    if (Number(form.expectedAttendees) < 1) {
      setError("Expected attendees must be at least 1.");
      return;
    }

    await onSubmit({
      bookingDate: form.bookingDate,
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose.trim(),
      expectedAttendees: Number(form.expectedAttendees)
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form className="resource-form" onSubmit={handleSubmit}>
          <h3>Edit Booking</h3>

          {error && <p className="form-message form-message-error">{error}</p>}

          <div className="field-grid">
            <label className="field">
              <span>Booking Date</span>
              <input
                type="date"
                value={form.bookingDate}
                onChange={(e) => updateField("bookingDate", e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Start Time</span>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => updateField("startTime", e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>End Time</span>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => updateField("endTime", e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Expected Attendees</span>
              <input
                type="number"
                min="1"
                value={form.expectedAttendees}
                onChange={(e) => updateField("expectedAttendees", e.target.value)}
                required
              />
            </label>

            <label className="field" style={{ gridColumn: "1 / -1" }}>
              <span>Purpose</span>
              <textarea
                value={form.purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
                placeholder="Describe the purpose of this booking..."
                style={{ minHeight: "100px" }}
                required
              ></textarea>
            </label>
          </div>

          <div className="action-row" style={{ marginTop: "1.5rem", justifyContent: "flex-end", gap: "1rem" }}>
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
              disabled={loading}
              style={{ marginTop: 0 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
              style={{ marginTop: 0 }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
