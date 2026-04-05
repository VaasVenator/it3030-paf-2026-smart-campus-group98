import InfoCard from "../components/InfoCard";
import PageHeader from "../components/PageHeader";
import { useApi } from "../hooks/useApi";

export default function DashboardPage() {
  const resources = useApi("/api/resources");
  const bookings = useApi("/api/bookings");
  const tickets = useApi("/api/tickets");
  const notifications = useApi("/api/notifications");

  const cards = [
    {
      label: "Available modules",
      value: "Resources, Bookings, Tickets, Notifications",
      tone: "accent"
    },
    {
      label: "Resources loaded",
      value: resources.loading ? "Loading..." : resources.data.length,
      tone: "default"
    },
    {
      label: "Bookings tracked",
      value: bookings.loading ? "Loading..." : bookings.data.length,
      tone: "warm"
    },
    {
      label: "Tickets tracked",
      value: tickets.loading ? "Loading..." : tickets.data.length,
      tone: "cool"
    },
    {
      label: "Notifications",
      value: notifications.loading ? "Loading..." : notifications.data.length,
      tone: "default"
    }
  ];

  return (
    <section>
      <PageHeader
        eyebrow="Operations Snapshot"
        title="Campus control center"
        description="This starter dashboard is wired to the Spring Boot API and gives your group a clean base for the final React client."
      />

      <div className="hero-panel">
        <div>
          <p className="hero-kicker">Ready for the assignment brief</p>
          <h3>Build out approval flows, ticket comments, Google login, and polished UI from here.</h3>
        </div>
        <p className="hero-note">
          API base URL: <code>{import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081"}</code>
        </p>
      </div>

      <div className="card-grid">
        {cards.map((card) => (
          <InfoCard key={card.label} {...card} />
        ))}
      </div>
    </section>
  );
}
