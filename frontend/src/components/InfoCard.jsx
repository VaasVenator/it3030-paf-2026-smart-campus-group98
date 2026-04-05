export default function InfoCard({ label, value, tone = "default" }) {
  return (
    <article className={`info-card info-card-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
