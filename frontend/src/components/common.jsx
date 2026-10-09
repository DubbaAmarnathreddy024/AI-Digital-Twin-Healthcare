import { Info } from "lucide-react";
import { NA, countOf, isEmptyValue, isObj } from "../utils/data";

export function Card({ children, className = "", as: Tag = "section", ...rest }) {
  return (
    <Tag className={`card ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="section-header">
      <div className="section-title-wrap">
        {Icon && (
          <span className="section-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        )}
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, children }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={20} aria-hidden="true" />}
      <span>{children}</span>
    </div>
  );
}

export function Disclaimer({ children }) {
  return (
    <p className="disclaimer" role="note">
      <Info size={14} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export function ErrorBanner({ errors }) {
  const entries = Object.entries(errors || {}).filter(([, v]) => v);
  if (!entries.length) return null;
  return (
    <div className="error-banner" role="alert">
      <strong>Some data could not be loaded.</strong>{" "}
      {entries.map(([k, v]) => `${k}: ${v}`).join(" · ")}. Check that the FastAPI server is running on
      http://127.0.0.1:8000.
    </div>
  );
}

function renderPrimitive(v) {
  if (v === null || v === undefined || v === "") return NA;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(3);
  return String(v);
}

function compact(v) {
  if (!isObj(v) && !Array.isArray(v)) return renderPrimitive(v);
  const s = JSON.stringify(v);
  return s.length > 90 ? `${s.slice(0, 90)}…` : s;
}

export function prettyKey(k) {
  return String(k).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Renders whatever the API returned for a section. Shows "Not Available" if empty.
export function DataBlock({ value, maxFields = 8, maxItems = 3 }) {
  if (isEmptyValue(value)) return <p className="muted">{NA}</p>;

  if (Array.isArray(value)) {
    const shown = value.slice(0, maxItems);
    return (
      <div className="data-block">
        <p className="data-count">
          {value.length} record{value.length === 1 ? "" : "s"}
        </p>
        <ul className="data-list">
          {shown.map((item, i) => (
            <li key={i}>
              {isObj(item)
                ? Object.entries(item)
                    .slice(0, 4)
                    .map(([k, v]) => `${prettyKey(k)}: ${compact(v)}`)
                    .join(" · ")
                : compact(item)}
            </li>
          ))}
        </ul>
        {value.length > maxItems && <p className="muted small">+ {value.length - maxItems} more</p>}
      </div>
    );
  }

  if (isObj(value)) {
    const entries = Object.entries(value);
    return (
      <dl className="kv-list">
        {entries.slice(0, maxFields).map(([k, v]) => (
          <div key={k} className="kv-row">
            <dt>{prettyKey(k)}</dt>
            <dd>{compact(v)}</dd>
          </div>
        ))}
        {entries.length > maxFields && (
          <p className="muted small">+ {entries.length - maxFields} more fields</p>
        )}
      </dl>
    );
  }

  return <p>{renderPrimitive(value)}</p>;
}

export function summaryCount(v) {
  const c = countOf(v);
  return c === null ? NA : c;
}
