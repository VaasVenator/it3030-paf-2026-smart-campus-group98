import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../auth/AuthContext";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../lib/api";
import Toast from "../components/Toast";

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
  const [activeSubTab, setActiveSubTab] = useState("LIST");

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

  // Auto-switch tabs when actions happen
  useEffect(() => {
    if (editingTicketId) {
      setActiveSubTab("NEW");
    }
  }, [editingTicketId]);

  useEffect(() => {
    if (selectedTicketId && (activeSubTab === "NEW" || (activeSubTab === "LIST" && !selectedTicket))) {
      // Stay on list or new if explicitly there, but if we just selected one maybe show management?
      // Actually let's just let the user click the tab.
    }
  }, [selectedTicketId]);

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
      setActiveSubTab("LIST");
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
    setActiveSubTab("NEW");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEditTicket() {
    setTicketForm(emptyTicketForm);
    setEditingTicketId("");
    setActiveSubTab("LIST");
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

  const subTabs = [
    { id: "NEW", label: "New Ticket" },
    { id: "LIST", label: isAdmin ? "All Tickets" : isTechnician ? "Assigned Tickets" : "My Tickets" },
    { id: "MANAGE", label: "Ticket Management" },
    { id: "COMMENTS", label: "Comments" }
  ];

  return (
    <section>
      <PageHeader
        eyebrow=""
        title="Maintenance and incident ticketing"
        description="Create incidents, assign technicians, manage workflow states, and collaborate through ticket comments."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", paddingBottom: "5rem" }}>
        
        {/* SUB-TABS NAV */}
        <div className="tab-bar">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`tab-button ${activeSubTab === tab.id ? "tab-button-active" : ""}`}
            >
              {tab.label}
              {tab.id === "COMMENTS" && selectedTicket && comments.length > 0 && (
                <span className="tab-count">
                  {comments.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: NEW TICKET */}
        {activeSubTab === "NEW" && (
          <div className="booking-panel" style={{ width: "95%", maxWidth: "none", margin: "0 auto", padding: "1.25rem 2rem", animation: "fadeIn 0.4s ease-out" }}>
            <h3 style={{ marginBottom: "1.5rem", textAlign: "center" }}>{editingTicketId ? "Edit Ticket" : "New Ticket"}</h3>

            <form className="booking-form" onSubmit={handleCreateTicket}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
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
                        {resource.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Location</span>
                  <input
                    value={ticketForm.location}
                    onChange={(event) => updateTicketField("location", event.target.value)}
                    placeholder="e.g. Engineering Lab 02"
                    required
                  />
                </label>

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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2rem", marginTop: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <label className="field">
                    <span>Preferred contact</span>
                    <input
                      value={ticketForm.preferredContact}
                      onChange={(event) => updateTicketField("preferredContact", event.target.value)}
                      placeholder="Email or phone"
                      required
                    />
                  </label>

                  <div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-soft)", display: "block", marginBottom: "0.75rem" }}>Evidence Images (Up to 3)</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                      {ticketForm.attachmentUrls.map((url, index) => (
                        <div key={`evidence-${index}`} style={{ position: "relative", width: "70px", height: "70px" }}>
                          {url ? (
                            <>
                              <img 
                                src={url} 
                                alt="Preview" 
                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px", border: "1px solid var(--border)" }} 
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const next = [...ticketForm.attachmentUrls];
                                  next.splice(index, 1);
                                  if (next.length === 0) next.push("");
                                  setTicketForm(prev => ({ ...prev, attachmentUrls: next }));
                                }}
                                style={{ 
                                  position: "absolute", top: "-8px", right: "-8px", width: "24px", height: "24px", 
                                  borderRadius: "50%", background: "var(--danger)", color: "white", border: "2px solid var(--surface)", 
                                  fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                              >
                                &times;
                              </button>
                            </>
                          ) : (
                            <label style={{ 
                              width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                              background: "rgba(255,255,255,0.03)", border: "1px dashed var(--border)", borderRadius: "12px",
                              cursor: "pointer", fontSize: "1.5rem", color: "var(--text-soft)", transition: "all 0.2s"
                            }}>
                              +
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(event) => {
                                  const file = event.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const next = [...ticketForm.attachmentUrls];
                                      next[index] = reader.result;
                                      if (next.length < 3 && next.every(u => u)) {
                                        next.push("");
                                      }
                                      setTicketForm(prev => ({ ...prev, attachmentUrls: next }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <label className="field" style={{ flex: 1 }}>
                    <span>Description</span>
                    <textarea
                      className="booking-textarea"
                      style={{ height: "100%", minHeight: "150px" }}
                      value={ticketForm.description}
                      onChange={(event) => updateTicketField("description", event.target.value)}
                      placeholder="Describe the fault, impact, or symptoms..."
                      required
                    />
                  </label>
                  <div className="action-row" style={{ marginTop: 0, justifyContent: "flex-end" }}>
                    <button type="submit" className="primary-button" style={{ width: "auto", padding: "0.8rem 2.5rem" }} disabled={saving || resourcesLoading}>
                      {saving ? "Submitting..." : editingTicketId ? "Update Ticket" : "Submit"}
                    </button>
                    {editingTicketId ? (
                      <button type="button" className="secondary-button" style={{ width: "auto" }} onClick={handleCancelEditTicket}>
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB CONTENT: ALL TICKETS */}
        {activeSubTab === "LIST" && (
          <div className="booking-panel" style={{ width: "95%", maxWidth: "none", margin: "0 auto", animation: "fadeIn 0.4s ease-out" }}>
            <div className="booking-toolbar" style={{ justifyContent: "center", marginBottom: "2.5rem" }}>
              <h3 style={{ margin: 0 }}>
                {isAdmin ? "All Tickets" : isTechnician ? "Assigned Tickets" : "My Tickets"}
              </h3>
            </div>

            <Toast message={message} onClear={() => setMessage("")} />
            {loading && <p className="state-text">Loading tickets...</p>}
            {error ? <p className="state-text state-error" style={{ textAlign: "center" }}>{error}</p> : null}

            <div className="stack-list" style={{ gap: "0.75rem" }}>
              {tickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className={`stack-card booking-card ${selectedTicketId === ticket.id ? "ticket-card-active" : ""}`}
                  style={{ 
                    padding: "1rem 1.5rem", 
                    borderRadius: "16px",
                    border: selectedTicketId === ticket.id ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: selectedTicketId === ticket.id ? "rgba(94, 234, 212, 0.05)" : "var(--panel-soft)"
                  }}
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <div className="stack-head" style={{ marginBottom: "0.75rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.1rem" }}>{ticket.category.replaceAll("_", " ")}</h3>
                      <p style={{ opacity: 0.7 }}>{ticket.location}</p>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                        <StatusBadge value={ticket.status} />
                        <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>ID: {ticket.id.slice(-6)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="stack-copy" style={{ marginBottom: "1rem", fontSize: "0.95rem", opacity: 0.9 }}>{ticket.description}</p>
                  
                  <div className="stack-meta" style={{ fontSize: "0.85rem", display: "flex", gap: "1.5rem" }}>
                    <span style={{ color: ticket.priority === "HIGH" || ticket.priority === "CRITICAL" ? "var(--danger)" : "inherit" }}>
                      ● {ticket.priority} Priority
                    </span>
                    <span>👤 {ticket.reporterName}</span>
                    {ticket.assignedTechnicianName && <span>🛠 {ticket.assignedTechnicianName}</span>}
                  </div>

                  <div className="resource-card-actions" style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button 
                        className="primary-button" 
                        style={{ width: "auto", marginTop: 0, padding: "0.4rem 1.25rem", fontSize: "0.85rem", background: selectedTicketId === ticket.id ? "var(--accent)" : "transparent", color: selectedTicketId === ticket.id ? "var(--bg)" : "var(--accent)", border: "1px solid var(--accent)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicketId(ticket.id);
                          setActiveSubTab("MANAGE");
                        }}
                      >
                        Manage
                      </button>
                      <button 
                        className="secondary-button" 
                        style={{ width: "auto", marginTop: 0, padding: "0.4rem 1.25rem", fontSize: "0.85rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicketId(ticket.id);
                          setActiveSubTab("COMMENTS");
                        }}
                      >
                        Comments
                      </button>
                    </div>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="secondary-button" style={{ marginTop: 0, padding: "0.4rem 1rem", fontSize: "0.85rem" }} onClick={(e) => { e.stopPropagation(); handleEditTicketClick(ticket); }}>Edit</button>
                        <button className="danger-button" style={{ marginTop: 0, padding: "0.4rem 1rem", fontSize: "0.85rem" }} onClick={(e) => { e.stopPropagation(); handleDeleteTicket(ticket.id); }}>Delete</button>
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {!loading && tickets.length === 0 ? (
                <div style={{ textAlign: "center", padding: "5rem", opacity: 0.6 }}>
                  <p className="state-text">No tickets found.</p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* TAB CONTENT: MANAGEMENT */}
        {activeSubTab === "MANAGE" && (
          <div className="booking-panel" style={{ width: "95%", maxWidth: "none", margin: "0 auto", padding: "1.25rem 2rem", animation: "fadeIn 0.4s ease-out" }}>
            {!selectedTicket ? (
              <div style={{ textAlign: "center", padding: "5rem" }}>
                <p style={{ opacity: 0.6, marginBottom: "1.5rem" }}>No ticket selected for management.</p>
                <button className="primary-button" style={{ width: "auto" }} onClick={() => setActiveSubTab("LIST")}>View All Tickets</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Ticket Management</h3>
                    <p style={{ opacity: 0.7 }}>Ref: {selectedTicket.id}</p>
                  </div>
                  <StatusBadge value={selectedTicket.status} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  {/* LEFT: Details */}
                  <div className="booking-panel" style={{ background: "rgba(255,255,255,0.02)", padding: "1.5rem", border: "1px solid var(--border)" }}>
                    <h4 style={{ marginBottom: "1.25rem", color: "var(--accent)" }}>Details</h4>
                    <div className="meta-grid" style={{ gridTemplateColumns: "1fr" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <dt style={{ opacity: 0.6 }}>Category</dt>
                        <dd>{selectedTicket.category.replaceAll("_", " ")}</dd>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <dt style={{ opacity: 0.6 }}>Location</dt>
                        <dd>{selectedTicket.location}</dd>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <dt style={{ opacity: 0.6 }}>Priority</dt>
                        <dd style={{ color: selectedTicket.priority === "HIGH" ? "var(--danger)" : "inherit" }}>{selectedTicket.priority}</dd>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <dt style={{ opacity: 0.6 }}>Reporter</dt>
                        <dd>{selectedTicket.reporterName}</dd>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <dt style={{ opacity: 0.6 }}>Contact</dt>
                        <dd>{selectedTicket.preferredContact}</dd>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: "1.5rem" }}>
                      <dt style={{ opacity: 0.6, fontSize: "0.85rem", marginBottom: "0.5rem" }}>Description</dt>
                      <dd style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", fontSize: "0.9rem" }}>{selectedTicket.description}</dd>
                    </div>

                    {selectedTicket.attachmentUrls?.length ? (
                      <div style={{ marginTop: "1.5rem" }}>
                        <dt style={{ opacity: 0.6, fontSize: "0.85rem", marginBottom: "0.75rem" }}>Evidence</dt>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          {selectedTicket.attachmentUrls.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt="Evidence" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)" }} />
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* RIGHT: Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {canManageTickets ? (
                      <>
                        {isAdmin && (
                          <div className="booking-panel" style={{ background: "rgba(255,255,255,0.02)", padding: "1.5rem", border: "1px solid var(--border)" }}>
                            <h4 style={{ marginBottom: "1.25rem", color: "var(--accent)" }}>Technician Assignment</h4>
                            <div className="booking-form" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                              <label className="field">
                                <span>Technician ID</span>
                                <input
                                  value={technicianForm.technicianId}
                                  onChange={(e) => setTechnicianForm(c => ({ ...c, technicianId: e.target.value }))}
                                  placeholder="TECH001"
                                />
                              </label>
                              <label className="field">
                                <span>Technician Name</span>
                                <input
                                  value={technicianForm.technicianName}
                                  onChange={(e) => setTechnicianForm(c => ({ ...c, technicianName: e.target.value }))}
                                  placeholder="Alex Perera"
                                />
                              </label>
                              <button className="secondary-button" style={{ gridColumn: "span 2", marginTop: "0.5rem" }} onClick={handleAssignTechnician} disabled={saving}>
                                Assign Technician
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="booking-panel" style={{ background: "rgba(255,255,255,0.02)", padding: "1.5rem", border: "1px solid var(--border)" }}>
                          <h4 style={{ marginBottom: "1.25rem", color: "var(--accent)" }}>Status Update</h4>
                          <div className="booking-form" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <label className="field">
                              <span>Next Status</span>
                              <select value={statusForm.status} onChange={(e) => setStatusForm(c => ({ ...c, status: e.target.value }))}>
                                <option value="">Select status</option>
                                {availableStatusOptions().map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
                              </select>
                            </label>
                            <label className="field">
                              <span>Resolution / Progress Notes</span>
                              <textarea className="booking-textarea" style={{ minHeight: "80px" }} value={statusForm.resolutionNotes} onChange={(e) => setStatusForm(c => ({ ...c, resolutionNotes: e.target.value }))} placeholder="Describe work done..." />
                            </label>
                            {statusForm.status === "REJECTED" && (
                              <label className="field">
                                <span>Rejection Reason</span>
                                <textarea className="booking-textarea" style={{ minHeight: "80px" }} value={statusForm.rejectionReason} onChange={(e) => setStatusForm(c => ({ ...c, rejectionReason: e.target.value }))} placeholder="Why is this rejected?" />
                              </label>
                            )}
                            <button className="primary-button" onClick={handleStatusUpdate} disabled={saving || !statusForm.status}>Update Status</button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="booking-panel" style={{ background: "rgba(255,255,255,0.02)", padding: "1.5rem", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
                        <p style={{ opacity: 0.6, textAlign: "center" }}>You do not have permission to modify this ticket.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: COMMENTS */}
        {activeSubTab === "COMMENTS" && (
          <div className="booking-panel" style={{ width: "95%", maxWidth: "none", margin: "0 auto", padding: "1.25rem 2rem", animation: "fadeIn 0.4s ease-out" }}>
            {!selectedTicket ? (
              <div style={{ textAlign: "center", padding: "5rem" }}>
                <p style={{ opacity: 0.6, marginBottom: "1.5rem" }}>No ticket selected for comments.</p>
                <button className="primary-button" style={{ width: "auto" }} onClick={() => setActiveSubTab("LIST")}>View All Tickets</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                  <h3>Conversation for Ticket: {selectedTicket.category.replaceAll("_", " ")}</h3>
                  <button className="secondary-button" style={{ marginTop: 0 }} onClick={() => setActiveSubTab("MANAGE")}>View Details</button>
                </div>

                <form className="booking-form" onSubmit={handleAddComment}>
                  <textarea
                    className="booking-textarea"
                    style={{ minHeight: "100px", background: "rgba(255,255,255,0.02)" }}
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder="Add an update, clarification, or resolution note"
                    required
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                    <button type="submit" className="primary-button" style={{ width: "auto", padding: "0.75rem 2rem" }} disabled={commentBusy}>
                      {commentBusy ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </form>

                {commentsLoading ? <p className="state-text">Loading conversation...</p> : null}

                <div className="comment-list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {comments.map((comment) => (
                    <article key={comment.id} className="comment-item" style={{ 
                      padding: "1rem 1.25rem", 
                      borderRadius: "16px",
                      background: comment.authorId === user?.userId ? "rgba(94, 234, 212, 0.05)" : "var(--panel-soft)",
                      border: comment.authorId === user?.userId ? "1px solid var(--accent-bg-strong)" : "1px solid var(--border)",
                      alignSelf: comment.authorId === user?.userId ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                      width: "fit-content",
                      minWidth: "300px"
                    }}>
                      <div className="comment-header" style={{ marginBottom: "0.5rem", justifyContent: "space-between" }}>
                        <span className="comment-user" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                          {comment.authorName} <span style={{ fontWeight: 400, opacity: 0.5, fontSize: "0.8rem" }}>• {comment.authorRole}</span>
                        </span>
                        <span className="comment-date" style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                          {new Date(comment.updatedAt).toLocaleString()}
                        </span>
                      </div>

                      {editingCommentId === comment.id ? (
                        <div style={{ marginTop: "1rem" }}>
                          <textarea
                            className="booking-review-textarea"
                            style={{ minHeight: "80px", background: "rgba(0,0,0,0.2)" }}
                            value={editingCommentMessage}
                            onChange={(event) => setEditingCommentMessage(event.target.value)}
                            autoFocus
                          />
                          <div className="comment-actions" style={{ marginTop: "0.5rem" }}>
                            <button className="primary-button" style={{ width: "auto", padding: "0.4rem 1rem", fontSize: "0.8rem" }} onClick={() => handleUpdateComment(comment.id)} disabled={commentBusy}>Save</button>
                            <button className="secondary-button" style={{ width: "auto", padding: "0.4rem 1rem", fontSize: "0.8rem" }} onClick={() => { setEditingCommentId(""); setEditingCommentMessage(""); }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="comment-body" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>{comment.message}</div>
                          {canEditComment(comment) && (
                            <div className="comment-actions" style={{ marginTop: "0.75rem", opacity: 0.6, fontSize: "0.8rem" }}>
                              <span className="comment-action-link" onClick={() => { setEditingCommentId(comment.id); setEditingCommentMessage(comment.message); }}>Edit</span>
                              <span className="comment-action-link comment-action-link-danger" onClick={() => handleDeleteComment(comment.id)}>Delete</span>
                            </div>
                          )}
                        </>
                      )}
                    </article>
                  ))}

                  {!commentsLoading && comments.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem", opacity: 0.5, border: "1px dashed var(--border)", borderRadius: "16px" }}>
                      No messages yet. Start the conversation!
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
