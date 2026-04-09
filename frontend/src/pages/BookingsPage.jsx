import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useApi } from "../hooks/useApi";

export default function BookingsPage() {
  const { data, loading, error } = useApi("/api/bookings");

  return (
    <section>
      <PageHeader
        eyebrow=""
        title="Booking workflow"
        description="View booking requests and their approval lifecycle from the backend."
      />

      {loading && <p className="state-text">Loading bookings...</p>}
      {error && <p className="state-text state-error">{error}</p>}

      <div className="stack-list">
        {data.map((booking) => (
          <article key={booking.id} className="stack-card">
            <div className="stack-head">
              <div>
                <h3>{booking.resourceName}</h3>
                <p>
                  {booking.bookingDate} | {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <StatusBadge value={booking.status} />
            </div>

            <p className="stack-copy">{booking.purpose}</p>
            <div className="stack-meta">
              <span>Requester: {booking.requesterName}</span>
              <span>Attendees: {booking.expectedAttendees}</span>
              <span>Reviewed by: {booking.reviewedBy ?? "Not reviewed yet"}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
