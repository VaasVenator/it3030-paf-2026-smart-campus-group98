import { useState } from "react";

const ticketCategories = ["ELECTRICAL", "PLUMBING", "HVAC", "IT", "GENERAL_MAINTENANCE"];
const ticketPriorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function TicketEditForm({
  ticket,
  onCancel,
  onSubmit,
  loading
}) {
  const [form, setForm] = useState({
    location: ticket.location,
    category: ticket.category,
    description: ticket.description,
    priority: ticket.priority,
    preferredContact: ticket.preferredContact,
    resourceId: ticket.resourceId || ""
  });
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.location.trim()) {
      setError("Location is required.");
      return;
    }

    if (!form.category) {
      setError("Category is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!form.priority) {
      setError("Priority is required.");
      return;
    }

    if (!form.preferredContact.trim()) {
      setError("Preferred contact is required.");
      return;
    }

    await onSubmit({
      location: form.location.trim(),
      category: form.category,
      description: form.description.trim(),
      priority: form.priority,
      preferredContact: form.preferredContact.trim(),
      resourceId: form.resourceId || null,
      attachmentUrls: ticket.attachmentUrls || []
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form className="resource-form" onSubmit={handleSubmit}>
          <h3>Edit Ticket</h3>

          {error && <p className="form-message form-message-error">{error}</p>}

          <div className="field-grid">
            <label className="field">
              <span>Location</span>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g., Building A, Room 101"
                required
              />
            </label>

            <label className="field">
              <span>Category</span>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {ticketCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Priority</span>
              <select
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
                required
              >
                <option value="">Select priority</option>
                {ticketPriorities.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Preferred Contact</span>
              <input
                type="text"
                value={form.preferredContact}
                onChange={(e) => updateField("preferredContact", e.target.value)}
                placeholder="e.g., email@example.com or phone number"
                required
              />
            </label>

            <label className="field" style={{ gridColumn: "1 / -1" }}>
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the issue in detail..."
                style={{ minHeight: "120px" }}
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
