import { EmptyState } from "./common";
import { Table2 } from "lucide-react";

export default function DataTable({ columns, rows, emptyText = "No wearable readings available.", caption }) {
  if (!rows || rows.length === 0) return <EmptyState icon={Table2}>{emptyText}</EmptyState>;
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={caption || "Data table"}>
      <table className="data-table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i === 0 ? "row-latest" : ""}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
