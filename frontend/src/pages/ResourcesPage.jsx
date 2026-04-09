import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import ResourceForm from "../components/ResourceForm";
import StatusBadge from "../components/StatusBadge";
import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

const typeOptions = ["", "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const statusOptions = ["", "ACTIVE", "OUT_OF_SERVICE"];

function buildQuery(filters, page, size) {
  const params = new URLSearchParams();

  if (filters.type) {
    params.set("type", filters.type);
  }
  if (filters.minCapacity) {
    params.set("minCapacity", String(filters.minCapacity));
  }
  if (filters.location.trim()) {
    params.set("location", filters.location.trim());
  }
  if (filters.status) {
    params.set("status", filters.status);
  }

  params.set("page", String(page));
  params.set("size", String(size));
  params.set("sortBy", filters.sortBy);
  params.set("sortOrder", filters.sortOrder);

  return params.toString();
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const pageSize = 12;

  const [resources, setResources] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    minCapacity: "",
    location: "",
    status: "",
    sortBy: "name",
    sortOrder: "ASC"
  });

  const [mode, setMode] = useState("none");
  const [selectedResource, setSelectedResource] = useState(null);

  const query = useMemo(
    () => buildQuery(filters, currentPage, pageSize),
    [filters, currentPage, pageSize]
  );

  async function loadResources() {
    try {
      setLoading(true);
      const payload = await apiGet(`/api/resources?${query}`, user);
      setResources(payload.content ?? []);
      setTotalPages(payload.totalPages ?? 0);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
  }, [query, user]);

  function updateFilter(field, value) {
    setCurrentPage(0);
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function openCreateForm() {
    setSelectedResource(null);
    setMode("create");
    setMessage("");
    setError("");
  }

  function openEditForm(resource) {
    setSelectedResource(resource);
    setMode("edit");
    setMessage("");
    setError("");
  }

  function closeForm() {
    setMode("none");
    setSelectedResource(null);
  }

  async function handleCreate(payload) {
    try {
      setSaving(true);
      await apiPost("/api/resources", payload, user);
      setMessage("Resource created successfully.");
      closeForm();
      await loadResources();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(payload) {
    if (!selectedResource) {
      return;
    }
    try {
      setSaving(true);
      await apiPut(`/api/resources/${selectedResource.id}`, payload, user);
      setMessage("Resource updated successfully.");
      closeForm();
      await loadResources();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(resourceId) {
    const confirmed = window.confirm("Delete this resource?");
    if (!confirmed) {
      return;
    }

    try {
      await apiDelete(`/api/resources/${resourceId}`, user);
      setMessage("Resource deleted successfully.");
      await loadResources();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section>
      <PageHeader
        eyebrow=""
        title="Facilities and assets catalogue"
        description="Browse and manage lecture halls, labs, meeting rooms, and equipment."
      />

      <div className="resource-toolbar">
        <div className="resource-filter-grid">
          <label className="field">
            <span>Type</span>
            <select
              value={filters.type}
              onChange={(event) => updateFilter("type", event.target.value)}
            >
              {typeOptions.map((type) => (
                <option key={type || "ALL_TYPES"} value={type}>
                  {type || "All types"}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Status</span>
            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
            >
              {statusOptions.map((status) => (
                <option key={status || "ALL_STATUS"} value={status}>
                  {status || "All status"}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Minimum capacity</span>
            <input
              type="number"
              min={1}
              value={filters.minCapacity}
              onChange={(event) => updateFilter("minCapacity", event.target.value)}
              placeholder="e.g. 40"
            />
          </label>

          <label className="field">
            <span>Location</span>
            <input
              value={filters.location}
              onChange={(event) => updateFilter("location", event.target.value)}
              placeholder="Building A"
            />
          </label>

          <label className="field">
            <span>Sort by</span>
            <select
              value={filters.sortBy}
              onChange={(event) => updateFilter("sortBy", event.target.value)}
            >
              <option value="name">Name</option>
              <option value="capacity">Capacity</option>
              <option value="type">Type</option>
              <option value="location">Location</option>
              <option value="status">Status</option>
            </select>
          </label>

          <label className="field">
            <span>Order</span>
            <select
              value={filters.sortOrder}
              onChange={(event) => updateFilter("sortOrder", event.target.value)}
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </label>
        </div>

        {isAdmin ? (
          <button type="button" className="primary-button resource-create-button" onClick={openCreateForm}>
            Create resource
          </button>
        ) : null}
      </div>

      {mode !== "none" ? (
        <div className="resource-form-panel">
          <ResourceForm
            initialData={mode === "edit" ? selectedResource : null}
            submitLabel={mode === "edit" ? "Update resource" : "Create resource"}
            onCancel={closeForm}
            onSubmit={mode === "edit" ? handleUpdate : handleCreate}
            loading={saving}
          />
        </div>
      ) : null}

      {message ? <p className="form-message">{message}</p> : null}
      {loading && <p className="state-text">Loading resources...</p>}
      {error && <p className="state-text state-error">{error}</p>}

      <div className="data-grid">
        {resources.map((resource) => (
          <article key={resource.id} className="data-card">
            <div className="data-card-top">
              <div>
                <h3>{resource.name}</h3>
                <p>{resource.location}</p>
              </div>
              <StatusBadge value={resource.status} />
            </div>

            <dl className="meta-grid">
              <div>
                <dt>Type</dt>
                <dd>{resource.type}</dd>
              </div>
              <div>
                <dt>Capacity</dt>
                <dd>{resource.capacity}</dd>
              </div>
              <div>
                <dt>Available</dt>
                <dd>
                  {resource.availabilityStart} - {resource.availabilityEnd}
                </dd>
              </div>
            </dl>

            <div className="tag-row">
              {(resource.amenities ?? []).map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
            </div>

            {isAdmin ? (
              <div className="resource-card-actions">
                <button type="button" className="secondary-button" onClick={() => openEditForm(resource)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDelete(resource.id)}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="pagination-bar">
        <button
          type="button"
          className="secondary-button"
          onClick={() => setCurrentPage((current) => Math.max(current - 1, 0))}
          disabled={currentPage === 0 || loading}
        >
          Previous
        </button>
        <span className="state-text">
          Page {currentPage + 1} of {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setCurrentPage((current) => current + 1)}
          disabled={loading || totalPages === 0 || currentPage + 1 >= totalPages}
        >
          Next
        </button>
      </div>
    </section>
  );
}
