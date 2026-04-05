import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { useApi } from "../hooks/useApi";

export default function ResourcesPage() {
  const { data, loading, error } = useApi("/api/resources");

  return (
    <section>
      <PageHeader
        eyebrow="Module A"
        title="Facilities and assets catalogue"
        description="Browse lecture halls, labs, rooms, and equipment from the backend resource service."
      />

      {loading && <p className="state-text">Loading resources...</p>}
      {error && <p className="state-text state-error">{error}</p>}

      <div className="data-grid">
        {data.map((resource) => (
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
          </article>
        ))}
      </div>
    </section>
  );
}
