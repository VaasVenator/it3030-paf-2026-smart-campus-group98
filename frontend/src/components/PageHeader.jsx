export default function PageHeader({ eyebrow, title, description }) {
  return (
    <header className="page-header">
      {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      <p className="page-description">{description}</p>
    </header>
  );
}
