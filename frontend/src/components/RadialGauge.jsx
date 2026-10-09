// SVG radial gauge for a 0-100 value
export default function RadialGauge({ value, size = 180, stroke = 14, label = "Probability" }) {
  const hasValue = value !== null && value !== undefined;
  const clamped = hasValue ? Math.min(100, Math.max(0, value)) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div
      className="gauge"
      style={{ width: size, height: size }}
      role="img"
      aria-label={hasValue ? `${label}: ${clamped.toFixed(1)} percent` : `${label}: Not Available`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} className="gauge-track" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="gauge-fill"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="gauge-center">
        <span className="gauge-reading">
          <span className="gauge-number">{hasValue ? clamped.toFixed(1) : "—"}</span>
          {hasValue && <span className="gauge-percent">%</span>}
        </span>
        <span className="gauge-label">{label}</span>
      </div>
    </div>
  );
}
