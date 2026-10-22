import { useEffect, useMemo, useState } from "react";
import { API_URL, getAuthToken } from "../api";
import "../components/PredictionHistory.css";

const percent = (value) =>
  value === null || value === undefined ? "—" : `${(Number(value) * 100).toFixed(1)}%`;

function dateLabel(value) {
  if (!value) return "Unknown date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(rows) {
  const columns = [
    ["Date", (row) => row.created_at],
    ["Condition", (row) => row.disease],
    ["Model output", (row) => row.prediction === 1 ? "Positive class" : "Negative class"],
    ["Probability", (row) => row.probability],
    ["Probability percentage", (row) => row.probability == null ? "" : (Number(row.probability) * 100).toFixed(2)],
    ["Risk band", (row) => row.risk_level],
  ];
  const content = [
    columns.map(([name]) => csvCell(name)).join(","),
    ...rows.map((row) => columns.map(([, getValue]) => csvCell(getValue(row))).join(",")),
  ].join("\\r\\n");
  const blob = new Blob(["\\uFEFF", content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `healthtwin-prediction-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function TrendChart({ items }) {
  const scored = items
    .filter((item) => item.probability !== null && item.probability !== undefined)
    .slice()
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
    .slice(-20);
  if (scored.length < 2) {
    return <div className="history-empty">At least two scored predictions for the selected condition are needed to draw a trend chart.</div>;
  }

  const width = 760, height = 250;
  const left = 48, right = 20, top = 18, bottom = 44;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const points = scored.map((item, index) => ({
    x: left + (scored.length === 1 ? plotWidth / 2 : index * plotWidth / (scored.length - 1)),
    y: top + (1 - Math.max(0, Math.min(1, Number(item.probability)))) * plotHeight,
    item,
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  return (
    <div className="trend-chart-wrap">
      <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Prediction score trend over time, for the selected condition">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = top + (1 - tick) * plotHeight;
          return <g key={tick}>
            <line x1={left} y1={y} x2={width - right} y2={y} className="trend-gridline" />
            <text x={left - 10} y={y + 4} textAnchor="end" className="trend-axis-label">{Math.round(tick * 100)}%</text>
          </g>;
        })}
        <polyline points={line} className="trend-line" />
        {points.map((point, index) => <circle key={`${point.item.id}-${index}`} cx={point.x} cy={point.y} r="4" className="trend-point">
          <title>{`${dateLabel(point.item.created_at)} — ${percent(point.item.probability)}`}</title>
        </circle>)}
        <text x={left} y={height - 12} className="trend-axis-label">{dateLabel(scored[0].created_at).split(",")[0]}</text>
        <text x={width - right} y={height - 12} textAnchor="end" className="trend-axis-label">{dateLabel(scored[scored.length - 1].created_at).split(",")[0]}</text>
      </svg>
      <p className="trend-caption">Showing up to the 20 most recent scored results for this condition. This visual is descriptive, not a clinical trend assessment.</p>
    </div>
  );
}

export default function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const headers = { Authorization: `Bearer ${getAuthToken()}` };
        const [historyResponse, compareResponse] = await Promise.all([
          fetch(`${API_URL}/predictions/history?limit=200`, { headers }),
          fetch(`${API_URL}/predictions/compare`, { headers }),
        ]);
        if (historyResponse.status === 401 || compareResponse.status === 401) {
          throw new Error("Your session may have expired. Please sign in again.");
        }
        if (!historyResponse.ok || !compareResponse.ok) {
          throw new Error("Could not load prediction history. Check that the backend is running and the new routes are installed.");
        }
        const historyData = await historyResponse.json();
        const compareData = await compareResponse.json();
        if (active) {
          setHistory(historyData.items || []);
          setComparison(compareData.conditions || []);
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load prediction history.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const diseases = useMemo(
    () => [...new Set(history.map((item) => item.disease))].sort(),
    [history]
  );
  const filtered = filter === "all"
    ? history
    : history.filter((item) => item.disease === filter);
  const filteredForExport = filtered;

  return (
    <section className="prediction-history-page">
      <div className="history-intro">
        <div>
          <p className="history-eyebrow">PERSONAL HEALTH RECORD</p>
          <h2>Prediction History & Comparison</h2>
          <p>Review your saved model estimates over time. This page shows only the history associated with your signed-in patient account.</p>
        </div>
        <div className="history-count">
          <strong>{history.length}</strong>
          <span>saved results loaded</span>
        </div>
      </div>

      {error && <div className="history-alert" role="alert">{error}</div>}
      {!loading && history.length > 0 && (
        <div className="history-actions">
          <button type="button" className="history-export-button" onClick={() => downloadCsv(filteredForExport)}>
            Export CSV
          </button>
        </div>
      )}
      {loading ? (
        <div className="history-empty" role="status">Loading your prediction history…</div>
      ) : (
        <>
          <div className="history-section-heading">
            <div><h3>Condition comparison</h3><p>Compare repeated estimates within the same condition only.</p></div>
          </div>
          {comparison.length === 0 ? (
            <div className="history-empty">No saved predictions yet. Run a heart, diabetes, or CKD prediction while signed in to start your history.</div>
          ) : (
            <div className="comparison-grid">
              {comparison.map((item) => (
                <article className="comparison-card" key={item.disease}>
                  <div className="comparison-card-top">
                    <h4>{item.disease}</h4>
                    <span className="history-pill">{item.count} result{item.count === 1 ? "" : "s"}</span>
                  </div>
                  <div className="comparison-values">
                    <div><span>Latest score</span><strong>{percent(item.latest?.probability)}</strong></div>
                    <div><span>Previous score</span><strong>{percent(item.previous?.probability)}</strong></div>
                  </div>
                  <p className="comparison-change">
                    {item.change_since_previous === null
                      ? "Need at least two scored results to show a change."
                      : `Change: ${item.change_since_previous > 0 ? "+" : ""}${(item.change_since_previous * 100).toFixed(1)} percentage points`}
                  </p>
                  <p className="comparison-date">Latest: {dateLabel(item.latest?.created_at)}</p>
                </article>
              ))}
            </div>
          )}

          <div className="history-section-heading history-table-heading">
            <div><h3>Score trend</h3><p>Choose one condition to view its score history over time.</p></div>
            <label className="history-filter">Chart condition
              <select value={filter === "all" ? (diseases[0] || "all") : filter} onChange={(event) => setFilter(event.target.value)}>
                {diseases.length === 0 && <option value="all">All conditions</option>}
                {diseases.map((disease) => <option value={disease} key={disease}>{disease}</option>)}
              </select>
            </label>
          </div>
          <TrendChart items={filter === "all" ? history.filter((item) => item.disease === diseases[0]) : filtered} />

          <div className="history-section-heading history-table-heading">
            <div><h3>Saved predictions</h3><p>Newest results appear first.</p></div>
            <label className="history-filter">Condition
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="all">All conditions</option>
                {diseases.map((disease) => <option value={disease} key={disease}>{disease}</option>)}
              </select>
            </label>
          </div>
          {filtered.length === 0 ? (
            <div className="history-empty">No history matches this filter.</div>
          ) : (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead><tr><th>Date</th><th>Condition</th><th>Model output</th><th>Score</th><th>Risk band</th></tr></thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id}>
                      <td>{dateLabel(item.created_at)}</td>
                      <td>{item.disease}</td>
                      <td>{item.prediction === 1 ? "Positive class" : "Negative class"}</td>
                      <td>{percent(item.probability)}</td>
                      <td><span className="history-pill">{item.risk_level || "Not recorded"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      <p className="history-disclaimer">
        Research prototype only — these scores are not diagnoses or treatment advice. A change in a model score does not by itself mean your health has improved or worsened. Discuss health concerns with a qualified healthcare professional.
      </p>
    </section>
  );
}
