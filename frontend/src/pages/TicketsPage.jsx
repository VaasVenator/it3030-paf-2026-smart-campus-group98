import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useApi } from "../hooks/useApi";

export default function TicketsPage() {
  const { data, loading, error } = useApi("/api/tickets");

  return (
    <section>
      <PageHeader
        eyebrow=""
        title="Maintenance and incident ticketing"
        description="Track issue reports, priorities, assigned technicians, and status changes."
      />

      {loading && <p className="state-text">Loading tickets...</p>}
      {error && <p className="state-text state-error">{error}</p>}

      <div className="data-grid">
        {data.map((ticket) => (
          <article key={ticket.id} className="data-card">
            <div className="data-card-top">
              <div>
                <h3>{ticket.category}</h3>
                <p>{ticket.location}</p>
              </div>
              <StatusBadge value={ticket.status} />
            </div>

            <p className="stack-copy">{ticket.description}</p>

            <dl className="meta-grid">
              <div>
                <dt>Priority</dt>
                <dd>{ticket.priority}</dd>
              </div>
              <div>
                <dt>Reporter</dt>
                <dd>{ticket.reporterName}</dd>
              </div>
              <div>
                <dt>Technician</dt>
                <dd>{ticket.assignedTechnicianName ?? "Unassigned"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
