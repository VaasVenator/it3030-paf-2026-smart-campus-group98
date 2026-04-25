import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../auth/AuthContext";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../lib/api";

const categoryOptions = [
  "ELECTRICAL",
  "NETWORK",
  "SOFTWARE",
  "HARDWARE",
  "CLEANING",
  "SAFETY",
  "OTHER"
];

const priorityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const emptyTicketForm = {
  resourceId: "",
  location: "",
  category: "HARDWARE",
  description: "",
  priority: "MEDIUM",
  preferredContact: "",
  attachmentUrls: [""]
};

const emptyTechnicianForm = {
  technicianId: "",
  technicianName: ""
};

const emptyStatusForm = {
  status: "",
  resolutionNotes: "",
  rejectionReason: ""
};

export default function TicketsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isTechnician = user?.role === "TECHNICIAN";
  const canManageTickets = isAdmin || isTechnician;

  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [loading, setLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [ticketForm, setTicketForm] = useState(emptyTicketForm);
  const [technicianForm, setTechnicianForm] = useState(emptyTechnicianForm);
  const [statusForm, setStatusForm] = useState(emptyStatusForm);
  const [commentDraft, setCommentDraft] = useState("");
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingCommentMessage, setEditingCommentMessage] = useState("");
  const [editingTicketId, setEditingTicketId] = useState("");

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId]
  );

  useEffect(() => {
    loadTickets();
    loadResources();
  }, [user]);

  useEffect(() => {
    if (!selectedTicketId) {
      setComments([]);
      return;
    }
    loadComments(selectedTicketId);
  }, [selectedTicketId]);

  useEffect(() => {
    if (!selectedTicket) {
      setTechnicianForm(emptyTechnicianForm);
      setStatusForm(emptyStatusForm);
      return;
    }

    setTechnicianForm({
      technicianId: selectedTicket.assignedTechnicianId ?? "",
      technicianName: selectedTicket.assignedTechnicianName ?? ""
    });
    setStatusForm({
      status: "",
      resolutionNotes: selectedTicket.resolutionNotes ?? "",
      rejectionReason: selectedTicket.rejectionReason ?? ""
    });
  }, [selectedTicket]);

  async function loadTickets() {
    try {
      setLoading(true);
      const payload = await apiGet("/api/tickets", user);
      const nextTickets = Array.isArray(payload) ? payload : [];
      setTickets(nextTickets);
      setSelectedTicketId((current) => {
        if (current && nextTickets.some((ticket) => ticket.id === current)) {
          return current;
        }
        return nextTickets[0]?.id ?? "";
      });
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
    } catch {
      setResources([]);
    } finally {
      setResourcesLoading(false);
    }
  }

  async function loadComments(ticketId) {
    try {
      setCommentsLoading(true);
      const payload = await apiGet(`/api/tickets/${ticketId}/comments`, user);
      setComments(Array.isArray(payload) ? payload : []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setCommentsLoading(false);
    }
  }

  function updateTicketField(field, value) {
    setTicketForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function updateAttachment(index, value) {
    setTicketForm((current) => ({
      ...current,
      attachmentUrls: current.attachmentUrls.map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    }));
  }

  function addAttachmentField() {
    setTicketForm((current) => {
      if (current.attachmentUrls.length >= 3) {
        return current;
      }
      return {
        ...current,
        attachmentUrls: [...current.attachmentUrls, ""]
      };
    });
  }

  function removeAttachmentField(index) {
    setTicketForm((current) => ({
      ...current,
      attachmentUrls:
        current.attachmentUrls.length === 1
          ? [""]
          : current.attachmentUrls.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  async function handleCreateTicket(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const ticketPayload = {
        ...ticketForm,
        resourceId: ticketForm.resourceId || null,
        attachmentUrls: ticketForm.attachmentUrls
          .map((item) => item.trim())
          .filter(Boolean)
      };

      if (editingTicketId) {
        await apiPut(`/api/tickets/${editingTicketId}`, ticketPayload, user);
        setMessage("Ticket updated successfully.");
      } else {
        await apiPost("/api/tickets", ticketPayload, user);
        setMessage("Ticket created successfully.");
      }

      setTicketForm(emptyTicketForm);
      setEditingTicketId("");
      await loadTickets();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEditTicketClick(ticket) {
    setTicketForm({
      resourceId: ticket.resourceId || "",
      location: ticket.location || "",
      category: ticket.category || "HARDWARE",
      description: ticket.description || "",
      priority: ticket.priority || "MEDIUM",
      preferredContact: ticket.preferredContact || "",
      attachmentUrls: ticket.attachmentUrls?.length ? ticket.attachmentUrls : [""]
    });
    setEditingTicketId(ticket.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEditTicket() {
    setTicketForm(emptyTicketForm);
    setEditingTicketId("");
  }

  async function handleDeleteTicket(ticketId) {
    const confirmed = window.confirm("Are you sure you want to completely delete this ticket?");
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      await apiDelete(`/api/tickets/${ticketId}`, user);
      setMessage("Ticket deleted successfully.");
      if (selectedTicketId === ticketId) {
        setSelectedTicketId("");
      }
      await loadTickets();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleAssignTechnician() {
    if (!selectedTicket) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiPatch(
        `/api/tickets/${selectedTicket.id}/assign`,
        technicianForm,
        user
      );
      setMessage("Technician assigned successfully.");
      await loadTickets();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusUpdate() {
    if (!selectedTicket || !statusForm.status) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiPatch(
        `/api/tickets/${selectedTicket.id}/status`,
        statusForm,
        user
      );
      setMessage("Ticket status updated successfully.");
      await loadTickets();
      await loadComments(selectedTicket.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddComment(event) {
    event.preventDefault();
    if (!selectedTicket) {
      return;
    }

    setCommentBusy(true);
    setError("");
    setMessage("");

    try {
      await apiPost(
        `/api/tickets/${selectedTicket.id}/comments`,
        { message: commentDraft },
        user
      );
      setCommentDraft("");
      setMessage("Comment added successfully.");
      await loadComments(selectedTicket.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCommentBusy(false);
    }
  }

  async function handleUpdateComment(commentId) {
    if (!selectedTicket) {
      return;
    }

    setCommentBusy(true);
    setError("");
    setMessage("");

    try {
      await apiPut(
        `/api/tickets/${selectedTicket.id}/comments/${commentId}`,
        { message: editingCommentMessage },
        user
      );
      setEditingCommentId("");
      setEditingCommentMessage("");
      setMessage("Comment updated successfully.");
      await loadComments(selectedTicket.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCommentBusy(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!selectedTicket) {
      return;
    }

    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) {
      return;
    }

    setCommentBusy(true);
    setError("");
    setMessage("");

    try {
      await apiDelete(`/api/tickets/${selectedTicket.id}/comments/${commentId}`, user);
      setMessage("Comment deleted successfully.");
      await loadComments(selectedTicket.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCommentBusy(false);
    }
  }

  function canEditComment(comment) {
    return user?.role === "ADMIN" || comment.authorId === user?.userId;
  }

  function availableStatusOptions() {
    if (!selectedTicket) {
      return [];
    }

    if (selectedTicket.status === "OPEN") {
      return isAdmin
        ? ["IN_PROGRESS", "REJECTED"]
        : ["IN_PROGRESS"];
    }

    if (selectedTicket.status === "IN_PROGRESS") {
      return isAdmin
        ? ["RESOLVED", "REJECTED"]
        : ["RESOLVED"];
    }

    if (selectedTicket.status === "RESOLVED") {
      return ["CLOSED"];
    }

    return [];
  }

  return (
    <section>
      <PageHeader
        eyebrow=""
        title="Maintenance and incident ticketing"
        description="Create incidents, assign technicians, manage workflow states, and collaborate through ticket comments."
      />

      <div className="booking-layout">
        <div className="booking-panel">
          <h3>{editingTicketId ? "Edit ticket" : "Report a new issue"}</h3>

          <form className="booking-form" onSubmit={handleCreateTicket}>
            <label className="field">
              <span>Resource</span>
              <select
                value={ticketForm.resourceId}
                onChange={(event) => updateTicketField("resourceId", event.target.value)}
                disabled={!!editingTicketId}
              >
                <option value="">Location-only issue</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} - {resource.location}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Location</span>
              <input
                value={ticketForm.location}
                onChange={(event) => updateTicketField("location", event.target.value)}
                placeholder="Example: Engineering Lab 02"
                required
              />
            </label>

            <div className="field-grid two-columns">
              <label className="field">
                <span>Category</span>
                <select
                  value={ticketForm.category}
                  onChange={(event) => updateTicketField("category", event.target.value)}
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Priority</span>
                <select
                  value={ticketForm.priority}
                  onChange={(event) => updateTicketField("priority", event.target.value)}
                >
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field">
              <span>Preferred contact</span>
              <input
                value={ticketForm.preferredContact}
                onChange={(event) => updateTicketField("preferredContact", event.target.value)}
                placeholder="Email or phone number"
                required
              />
            </label>

            <label className="field">
              <span>Description</span>
              <textarea
                className="booking-textarea"
                value={ticketForm.description}
                onChange={(event) => updateTicketField("description", event.target.value)}
                placeholder="Describe the fault, impact, or symptoms"
                required
              />
            </label>

            <div className="resource-form-panel">
              <h3>Evidence links</h3>
              <p className="state-text">Up to 3 image URLs can be attached to each ticket.</p>
              <div className="resource-form">
                {ticketForm.attachmentUrls.map((attachmentUrl, index) => (
                  <div key={`attachment-${index}`} className="resource-card-actions">
                    <input
                      value={attachmentUrl}
                      onChange={(event) => updateAttachment(index, event.target.value)}
                      placeholder={`Image URL ${index + 1}`}
                    />
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => removeAttachmentField(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="secondary-button"
                  onClick={addAttachmentField}
                  disabled={ticketForm.attachmentUrls.length >= 3}
                >
                  Add another image
                </button>
              </div>
            </div>

            <div className="action-row">
              <button type="submit" className="primary-button" disabled={saving || resourcesLoading}>
                {saving ? "Submitting..." : editingTicketId ? "Update ticket" : "Create ticket"}
              </button>
              {editingTicketId ? (
                <button type="button" className="secondary-button" onClick={handleCancelEditTicket}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="booking-panel booking-panel-wide">
          <div className="booking-toolbar">
            <h3>
              {isAdmin ? "All tickets" : isTechnician ? "Assigned tickets" : "My tickets"}
            </h3>
          </div>

          {message ? <p className="form-message form-message-success">{message}</p> : null}
          {loading && <p className="state-text">Loading tickets...</p>}
          {error ? <p className="state-text state-error">{error}</p> : null}

          <div className="stack-list">
            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                className={`stack-card booking-card ${selectedTicketId === ticket.id ? "ticket-card-active" : ""}`}
              >
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
                  <span>Technician: {ticket.assignedTechnicianName ?? "Unassigned"}</span>
                </div>

                <div className="resource-card-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    {selectedTicketId === ticket.id ? "Viewing details" : "View details"}
                  </button>
                  {!isAdmin && ticket.status === "OPEN" ? (
                    <>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleEditTicketClick(ticket)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDeleteTicket(ticket.id)}
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}

            {!loading && tickets.length === 0 ? (
              <p className="state-text">No tickets found for your current role.</p>
            ) : null}
          </div>
        </div>
      </div>

      {selectedTicket ? (
        <div className="booking-layout">
          {canManageTickets ? (
            <div className="booking-panel">
              <h3>Ticket actions</h3>

              {isAdmin ? (
                <div className="resource-form">
                  <label className="field">
                    <span>Technician ID</span>
                    <input
                      value={technicianForm.technicianId}
                      onChange={(event) =>
                        setTechnicianForm((current) => ({
                          ...current,
                          technicianId: event.target.value
                        }))
                      }
                      placeholder="TECH001"
                    />
                  </label>

                  <label className="field">
                    <span>Technician name</span>
                    <input
                      value={technicianForm.technicianName}
                      onChange={(event) =>
                        setTechnicianForm((current) => ({
                          ...current,
                          technicianName: event.target.value
                        }))
                      }
                      placeholder="Alex Perera"
                    />
                  </label>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleAssignTechnician}
                    disabled={saving}
                  >
                    Assign technician
                  </button>
                </div>
              ) : null}

              <div className="resource-form">
                <label className="field">
                  <span>Next status</span>
                  <select
                    value={statusForm.status}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        status: event.target.value
                      }))
                    }
                  >
                    <option value="">Select status</option>
                    {availableStatusOptions().map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Resolution notes</span>
                  <textarea
                    className="booking-textarea"
                    value={statusForm.resolutionNotes}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        resolutionNotes: event.target.value
                      }))
                    }
                    placeholder="Explain what was done"
                  />
                </label>

                <label className="field">
                  <span>Rejection reason</span>
                  <textarea
                    className="booking-textarea"
                    value={statusForm.rejectionReason}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        rejectionReason: event.target.value
                      }))
                    }
                    placeholder="Only required when rejecting"
                  />
                </label>

                <button
                  type="button"
                  className="primary-button"
                  onClick={handleStatusUpdate}
                  disabled={saving || !statusForm.status}
                >
                  Update status
                </button>
              </div>
            </div>
          ) : (
            <div className="booking-panel">
              <h3>Ticket details</h3>
              <div className="meta-grid">
                <div>
                  <dt>Current status</dt>
                  <dd>{selectedTicket.status}</dd>
                </div>
                <div>
                  <dt>Priority</dt>
                  <dd>{selectedTicket.priority}</dd>
                </div>
                <div>
                  <dt>Preferred contact</dt>
                  <dd>{selectedTicket.preferredContact}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{new Date(selectedTicket.createdAt).toLocaleString()}</dd>
                </div>
              </div>

              {selectedTicket.attachmentUrls?.length ? (
                <div className="tag-row">
                  {selectedTicket.attachmentUrls.map((attachmentUrl) => (
                    <a
                      key={attachmentUrl}
                      className="tag"
                      href={attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View attachment
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          <div className="booking-panel booking-panel-wide">
            <h3>Comments</h3>

            <form className="booking-form" onSubmit={handleAddComment}>
              <textarea
                className="booking-textarea"
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Add an update, clarification, or resolution note"
                required
              />
              <button type="submit" className="primary-button" disabled={commentBusy}>
                {commentBusy ? "Saving..." : "Add comment"}
              </button>
            </form>

            {commentsLoading ? <p className="state-text">Loading comments...</p> : null}

            <div className="comment-list">
              {comments.map((comment) => (
                <article key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-user">
                      {comment.authorName} <span style={{ fontWeight: 400, opacity: 0.6 }}>({comment.authorRole})</span>
                    </span>
                    <span className="comment-date">
                      {new Date(comment.updatedAt).toLocaleString()}
                    </span>
                  </div>

                  {editingCommentId === comment.id ? (
                    <div style={{ marginTop: "1rem" }}>
                      <textarea
                        className="booking-review-textarea"
                        value={editingCommentMessage}
                        onChange={(event) => setEditingCommentMessage(event.target.value)}
                        autoFocus
                      />
                      <div className="comment-actions">
                        <button
                          type="button"
                          className="primary-button"
                          style={{ width: "auto", margin: 0 }}
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={commentBusy}
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            setEditingCommentId("");
                            setEditingCommentMessage("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="comment-body">{comment.message}</div>
                      {canEditComment(comment) && (
                        <div className="comment-actions">
                          <span 
                            className="comment-action-link"
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditingCommentMessage(comment.message);
                            }}
                          >
                            Edit
                          </span>
                          <span 
                            className="comment-action-link comment-action-link-danger"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Delete
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </article>
              ))}

              {!commentsLoading && comments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", opacity: 0.6 }}>
                  No messages yet. Start the conversation!
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
