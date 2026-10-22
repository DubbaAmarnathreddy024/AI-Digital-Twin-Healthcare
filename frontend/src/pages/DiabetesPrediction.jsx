import { useState } from "react";
import { Activity, AlertCircle, CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import { API_URL } from "../api";

const INITIAL_FORM = {
  pregnancies: "0",
  glucose: "120",
  bloodpressure: "70",
  skinthickness: "20",
  insulin: "79",
  bmi: "25.5",
  diabetespedigreefunction: "0.35",
  age: "30",
};

const FIELDS = [
  { name: "pregnancies", label: "Pregnancies", type: "number", min: 0, max: 30, step: 1, hint: "Number of pregnancies" },
  { name: "glucose", label: "Glucose", type: "number", min: 1, max: 500, step: 0.1, unit: "mg/dL" },
  { name: "bloodpressure", label: "Blood pressure", type: "number", min: 1, max: 300, step: 0.1, unit: "mmHg" },
  { name: "skinthickness", label: "Skin thickness", type: "number", min: 0, max: 150, step: 0.1, unit: "mm" },
  { name: "insulin", label: "Insulin", type: "number", min: 0, max: 3000, step: 0.1, unit: "mu U/mL" },
  { name: "bmi", label: "BMI", type: "number", min: 0.1, max: 150, step: 0.1, unit: "kg/m²" },
  { name: "diabetespedigreefunction", label: "Diabetes pedigree function", type: "number", min: 0, max: 10, step: 0.01 },
  { name: "age", label: "Age", type: "number", min: 18, max: 120, step: 1, unit: "years" },
];

function riskClass(band) {
  const normalized = String(band || "").toLowerCase();
  if (normalized === "low") return "diabetes-risk-low";
  if (normalized === "moderate") return "diabetes-risk-moderate";
  return "diabetes-risk-high";
}

export default function DiabetesPrediction() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, Number(value)])
    );

    try {
      const token = localStorage.getItem("healthTwinToken");
      if (!token) {
        throw new Error("Your session is missing. Please log out and sign in again.");
      }

      const response = await fetch(`${API_URL}/predictions/diabetes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("healthTwinToken") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = response.status === 401
          ? "Your session was rejected or has expired. Please log out and sign in again."
          : typeof body.detail === "string"
            ? body.detail
            : "The server could not complete the prediction. Check the backend logs.";
        throw new Error(detail);
      }

      setResult(body);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the API. Confirm the FastAPI server is running at http://127.0.0.1:8000."
          : err.message || "Prediction failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setResult(null);
    setError("");
  };

  return (
    <section className="diabetes-page">
      <style>{`
        .diabetes-page { color: var(--text, #172033); }
        .diabetes-hero { display:flex; align-items:flex-start; gap:14px; padding:22px; border:1px solid var(--border, #e3e8ef); border-radius:18px; background:var(--card, #fff); margin-bottom:20px; }
        .diabetes-hero-icon { display:grid; place-items:center; flex:0 0 48px; width:48px; height:48px; border-radius:14px; background:#e8f5ee; color:#18794e; }
        .diabetes-hero h2 { margin:0 0 6px; font-size:1.18rem; }
        .diabetes-hero p { margin:0; color:var(--muted, #667085); line-height:1.55; }
        .diabetes-layout { display:grid; grid-template-columns:minmax(0, 1.25fr) minmax(270px, .75fr); gap:20px; align-items:start; }
        .diabetes-card { border:1px solid var(--border, #e3e8ef); border-radius:18px; padding:22px; background:var(--card, #fff); min-width:0; }
        .diabetes-card h3 { margin:0 0 5px; font-size:1.05rem; }
        .diabetes-muted { color:var(--muted, #667085); font-size:.9rem; line-height:1.5; margin:0 0 18px; }
        .diabetes-fields { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:15px; }
        .diabetes-field label { display:block; font-size:.88rem; font-weight:600; margin-bottom:7px; }
        .diabetes-field input { box-sizing:border-box; width:100%; min-height:43px; border:1px solid var(--border, #d0d5dd); border-radius:10px; padding:10px 12px; background:var(--input-bg, #fff); color:inherit; font:inherit; }
        .diabetes-field input:focus { outline:2px solid #9bcdb4; outline-offset:1px; }
        .diabetes-unit { display:block; margin-top:4px; color:var(--muted, #667085); font-size:.78rem; }
        .diabetes-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:20px; }
        .diabetes-button { border:0; border-radius:10px; padding:11px 16px; min-height:43px; font:inherit; font-weight:650; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; }
        .diabetes-button-primary { background:#18794e; color:white; }
        .diabetes-button-secondary { background:var(--surface-secondary, #f1f4f8); color:inherit; }
        .diabetes-button:disabled { opacity:.65; cursor:wait; }
        .diabetes-error { display:flex; gap:9px; padding:12px 14px; border-radius:10px; margin:0 0 16px; color:#9b1c1c; background:#fff0f0; line-height:1.45; }
        .diabetes-result-placeholder { border:1px dashed var(--border, #d0d5dd); border-radius:14px; padding:25px 18px; text-align:center; color:var(--muted, #667085); }
        .diabetes-result-placeholder svg { margin-bottom:10px; }
        .diabetes-result { border:1px solid var(--border, #e3e8ef); border-radius:14px; padding:18px; }
        .diabetes-result h4 { margin:0 0 12px; font-size:1rem; }
        .diabetes-risk-pill { display:inline-flex; border-radius:999px; padding:6px 11px; font-size:.82rem; font-weight:700; margin-bottom:12px; }
        .diabetes-risk-low { background:#e7f7ed; color:#17663c; }
        .diabetes-risk-moderate { background:#fff4d6; color:#875d00; }
        .diabetes-risk-high { background:#ffebeb; color:#a11b1b; }
        .diabetes-score { font-size:2.1rem; font-weight:750; letter-spacing:-.04em; margin:0 0 8px; }
        .diabetes-meter { height:9px; background:var(--surface-secondary, #edf0f4); border-radius:99px; overflow:hidden; margin:13px 0 17px; }
        .diabetes-meter-fill { height:100%; background:#18794e; border-radius:99px; }
        .diabetes-warning { font-size:.82rem; line-height:1.5; color:var(--muted, #667085); border-top:1px solid var(--border, #e3e8ef); padding-top:13px; margin:14px 0 0; }
        .diabetes-safety { margin-top:18px; padding:14px 16px; border-radius:12px; background:#fff8e8; color:#744c00; font-size:.86rem; line-height:1.55; }
        @media (max-width: 850px) { .diabetes-layout { grid-template-columns:1fr; } }
        @media (max-width: 520px) { .diabetes-fields { grid-template-columns:1fr; } .diabetes-card { padding:16px; } .diabetes-hero { padding:16px; } }
      `}</style>

      <div className="diabetes-hero">
        <div className="diabetes-hero-icon"><Activity size={25} /></div>
        <div>
          <h2>Diabetes Risk Prediction</h2>
          <p>Enter the eight clinical features used by the trained model to generate an experimental risk estimate.</p>
        </div>
      </div>

      <div className="diabetes-layout">
        <form className="diabetes-card" onSubmit={handleSubmit}>
          <h3>Clinical inputs</h3>
          <p className="diabetes-muted">Use measured values when available. The prefilled values are for API demonstration only.</p>

          {error && (
            <div className="diabetes-error" role="alert">
              <AlertCircle size={19} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="diabetes-fields">
            {FIELDS.map((field) => (
              <div className="diabetes-field" key={field.name}>
                <label htmlFor={`diabetes-${field.name}`}>{field.label}</label>
                <input
                  id={`diabetes-${field.name}`}
                  name={field.name}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                />
                {field.unit && <span className="diabetes-unit">{field.unit}</span>}
              </div>
            ))}
          </div>

          <div className="diabetes-actions">
            <button className="diabetes-button diabetes-button-primary" type="submit" disabled={loading}>
              {loading ? <><LoaderCircle size={17} className="diabetes-spin" /> Predicting…</> : "Estimate risk"}
            </button>
            <button className="diabetes-button diabetes-button-secondary" type="button" onClick={resetForm} disabled={loading}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </form>

        <aside className="diabetes-card" aria-live="polite">
          <h3>Prediction result</h3>
          <p className="diabetes-muted">The result appears here after the API responds.</p>

          {!result ? (
            <div className="diabetes-result-placeholder">
              <Activity size={30} aria-hidden="true" />
              <div style={{ fontWeight: 650, marginBottom: 5 }}>Ready for assessment</div>
              <div style={{ fontSize: ".88rem", lineHeight: 1.5 }}>Submit the form to request a model estimate.</div>
            </div>
          ) : (
            <div className="diabetes-result">
              <h4>{result.condition || "Diabetes risk estimation"}</h4>
              <span className={`diabetes-risk-pill ${riskClass(result.risk_band)}`}>
                {result.risk_band || "Result returned"} prototype band
              </span>
              <p className="diabetes-score">{Number(result.risk_percentage).toFixed(2)}%</p>
              <div className="diabetes-muted">Model score: {Number(result.risk_score).toFixed(4)} on a 0–1 scale</div>
              <div className="diabetes-meter" aria-label={`Model score ${Number(result.risk_percentage).toFixed(2)} percent`}>
                <div className="diabetes-meter-fill" style={{ width: `${Math.min(100, Math.max(0, Number(result.risk_percentage) || 0))}%` }} />
              </div>
              <div className="diabetes-muted">Model: {result.model || "Diabetes model"}</div>
              <p className="diabetes-warning">{result.disclaimer || "Research prototype only; not a diagnosis."}</p>
            </div>
          )}

          <div className="diabetes-safety">
            <strong>Important:</strong> This experimental model score is not a diagnosis or a calibrated probability of developing diabetes. Do not use it to make treatment decisions. Discuss health concerns and test results with a qualified healthcare professional.
          </div>
        </aside>
      </div>
    </section>
  );
}
