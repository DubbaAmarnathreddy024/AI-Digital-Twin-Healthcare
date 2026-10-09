export default function FeatureBar({ name, value, max, rank, large = false }) {
  const pct = max > 0 ? Math.max(2, (Math.abs(value) / max) * 100) : 0;
  return (
    <li className={`feature-row${large ? " large" : ""}`}>
      <span className="feature-rank" aria-hidden="true">
        {rank}
      </span>
      <span className="feature-name">{name}</span>
      <div
        className="feature-track"
        role="meter"
        aria-label={`${name} importance`}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.abs(value)}
      >
        <div className="feature-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="feature-value">{Math.abs(value).toFixed(4)}</span>
    </li>
  );
}
