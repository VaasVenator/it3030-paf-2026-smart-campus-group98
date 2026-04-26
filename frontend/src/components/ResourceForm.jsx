import { useMemo, useState } from "react";

const resourceTypes = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT", "OPEN_AREA"];
const resourceStatuses = ["ACTIVE", "OUT_OF_SERVICE"];

function buildInitialForm(initialData) {
  if (!initialData) {
    return {
      name: "",
      type: "LECTURE_HALL",
      capacity: 1,
      location: "",
      availabilityStart: "08:00",
      availabilityEnd: "17:00",
      status: "ACTIVE",
      amenitiesText: ""
    };
  }

  return {
    name: initialData.name ?? "",
    type: initialData.type ?? "LECTURE_HALL",
    capacity: initialData.capacity ?? 1,
    location: initialData.location ?? "",
    availabilityStart: initialData.availabilityStart ?? "08:00",
    availabilityEnd: initialData.availabilityEnd ?? "17:00",
    status: initialData.status ?? "ACTIVE",
    amenitiesText: (initialData.amenities ?? []).join(", ")
  };
}

function parseAmenities(amenitiesText) {
  if (!amenitiesText.trim()) {
    return [];
  }

  return amenitiesText
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ResourceForm({
  initialData,
  submitLabel,
  onCancel,
  onSubmit,
  loading
}) {
  const [form, setForm] = useState(() => buildInitialForm(initialData));
  const [localError, setLocalError] = useState("");

  const title = useMemo(
    () => (initialData ? "Edit resource" : "Create resource"),
    [initialData]
  );

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.location.trim()) {
      setLocalError("Name and location are required.");
      return;
    }

    if (Number(form.capacity) < 1) {
      setLocalError("Capacity must be at least 1.");
      return;
    }

    if (form.availabilityStart >= form.availabilityEnd) {
      setLocalError("Availability start time must be before end time.");
      return;
    }

    setLocalError("");

    await onSubmit({
      name: form.name.trim(),
      type: form.type,
      capacity: Number(form.capacity),
      location: form.location.trim(),
      availabilityStart: form.availabilityStart,
      availabilityEnd: form.availabilityEnd,
      status: form.status,
      amenities: parseAmenities(form.amenitiesText)
    });
  }

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <h3>{title}</h3>

      <div className="field-grid">
        <label className="field">
          <span>Name</span>
          <input
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Main Lecture Hall A"
            required
          />
        </label>

        <label className="field">
          <span>Type</span>
          <select
            value={form.type}
            onChange={(event) => updateField("type", event.target.value)}
          >
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Capacity</span>
          <input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(event) => updateField("capacity", event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(event) => updateField("status", event.target.value)}
          >
            {resourceStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Availability start</span>
          <input
            type="time"
            value={form.availabilityStart}
            onChange={(event) => updateField("availabilityStart", event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Availability end</span>
          <input
            type="time"
            value={form.availabilityEnd}
            onChange={(event) => updateField("availabilityEnd", event.target.value)}
            required
          />
        </label>
      </div>

      <label className="field">
        <span>Location</span>
        <input
          value={form.location}
          onChange={(event) => updateField("location", event.target.value)}
          placeholder="Faculty Building A"
          required
        />
      </label>

      <label className="field">
        <span>Amenities (comma separated)</span>
        <input
          value={form.amenitiesText}
          onChange={(event) => updateField("amenitiesText", event.target.value)}
          placeholder="Projector, Air Conditioning"
        />
      </label>

      {localError ? <p className="form-message form-message-error">{localError}</p> : null}

      <div className="resource-form-actions">
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </button>
        <button type="button" className="secondary-button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}
