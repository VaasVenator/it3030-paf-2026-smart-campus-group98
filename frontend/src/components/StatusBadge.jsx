export default function StatusBadge({ value }) {
  const normalized = String(value ?? "UNKNOWN").toLowerCase().replace(/_/g, "-");

  return <span className={`badge badge-${normalized}`}>{value}</span>;
}
