export default function PageHeader({ eyebrow, title, description, centered = false }) {
  return (
    <header className={`page-header ${centered ? "centered" : ""}`}>
      {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      <p className="page-description">{description}</p>
    </header>
  );
}
