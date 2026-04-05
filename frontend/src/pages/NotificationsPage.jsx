import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useApi } from "../hooks/useApi";

export default function NotificationsPage() {
  const { data, loading, error } = useApi("/api/notifications");

  return (
    <section>
      <PageHeader
        eyebrow="Module D"
        title="Notification center"
        description="Expose booking, ticket, and comment notifications from the backend."
      />

      {loading && <p className="state-text">Loading notifications...</p>}
      {error && <p className="state-text state-error">{error}</p>}

      <div className="stack-list">
        {data.map((notification) => (
          <article key={notification.id} className="stack-card">
            <div className="stack-head">
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
              </div>
              <StatusBadge value={notification.read ? "READ" : "NEW"} />
            </div>
            <div className="stack-meta">
              <span>{notification.type}</span>
              <span>{notification.createdAt}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
