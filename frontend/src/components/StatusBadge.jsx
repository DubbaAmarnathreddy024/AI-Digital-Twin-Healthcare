export default function StatusBadge({ tone = "neutral", dot = false, pulse = false, children }) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className={`badge-dot${pulse ? " pulse" : ""}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
