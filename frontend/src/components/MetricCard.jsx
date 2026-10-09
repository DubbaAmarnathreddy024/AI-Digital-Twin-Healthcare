import { useEffect, useRef, useState } from "react";
import StatusBadge from "./StatusBadge";

// Shows one live metric. The card flashes softly when the value changes after a poll.
export default function MetricCard({ icon: Icon, label, value, unit, status, tone = "info", live = true }) {
  const prev = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prev.current !== value && prev.current !== undefined) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 900);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);

  const missing = value === null || value === undefined;

  return (
    <article className={`metric-card tone-${tone}${flash ? " flash" : ""}`} aria-label={label}>
      <div className="metric-top">
        <span className="metric-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        {live && !missing && (
          <StatusBadge tone="success" dot pulse>
            Live
          </StatusBadge>
        )}
      </div>
      <p className="metric-label">{label}</p>
      <p className="metric-value">
        <span className="metric-number">{missing ? "—" : value}</span>
        {!missing && unit && <span className="metric-unit">{unit}</span>}
      </p>
      <p className="metric-status">
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </p>
    </article>
  );
}
