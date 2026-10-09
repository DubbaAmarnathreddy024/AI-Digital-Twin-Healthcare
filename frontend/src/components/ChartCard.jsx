import { EmptyState } from "./common";
import { Activity } from "lucide-react";

export default function ChartCard({ title, subtitle, hasData, children }) {
  return (
    <section className="card chart-card" aria-label={title}>
      <div className="chart-head">
        <h3 className="chart-title">{title}</h3>
        {subtitle && <span className="muted small">{subtitle}</span>}
      </div>
      <div className="chart-body">
        {hasData ? children : <EmptyState icon={Activity}>No wearable readings available.</EmptyState>}
      </div>
    </section>
  );
}
