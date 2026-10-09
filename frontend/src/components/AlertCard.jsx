import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { alertTone, fmtDateTime } from "../utils/data";

const ICONS = { danger: ShieldAlert, warning: AlertTriangle, info: Info };

export function AlertCard({ alert }) {
  const tone = alertTone(alert.severity);
  const Icon = ICONS[tone];
  return (
    <li className={`alert-card alert-${tone}`}>
      <span className="alert-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className="alert-body">
        <p className="alert-message">{alert.message}</p>
        <p className="alert-meta">
          {alert.metric ? `${alert.metric} · ` : ""}
          {alert.ts ? fmtDateTime(alert.ts) : "Time not available"}
        </p>
      </div>
      {alert.severity && <StatusBadge tone={tone}>{String(alert.severity)}</StatusBadge>}
    </li>
  );
}

export function AlertList({ alerts, limit = 5 }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="no-alerts" role="status">
        <CheckCircle2 size={22} aria-hidden="true" />
        <div>
          <p className="no-alerts-title">No Active Alerts</p>
          <p className="muted small">All monitored values are within the configured prototype settings.</p>
        </div>
      </div>
    );
  }
  const ordered = [...alerts].reverse().slice(0, limit);
  return (
    <ul className="alert-list">
      {ordered.map((a, i) => (
        <AlertCard key={`${a.id}-${i}`} alert={a} />
      ))}
    </ul>
  );
}
