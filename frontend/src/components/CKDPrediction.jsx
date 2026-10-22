import { useState } from "react";
import {
  Activity,
  AlertCircle,
  LoaderCircle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { API_URL } from "../api";

const INITIAL_FORM = {
  age: "48",
  bp: "80",
  sg: "1.02",
  al: "1",
  su: "0",
  bgr: "121",
  bu: "36",
  sc: "1.2",
  sod: "138",
  pot: "4.5",
  hemo: "14",
  pcv: "44",
  wbcc: "7800",
  rbcc: "5.2",
  rbc: "normal",
  pc: "normal",
  pcc: "notpresent",
  ba: "notpresent",
  htn: "no",
  dm: "no",
  cad: "no",
  appet: "good",
  pe: "no",
  ane: "no",
};

const NUMERIC_FIELDS = [
  { name: "age", label: "Age", min: 0, max: 120, step: 1, unit: "years" },
  { name: "bp", label: "Blood pressure", min: 0, max: 300, step: 1, unit: "mmHg" },
  { name: "sg", label: "Specific gravity", min: 0, max: 2, step: 0.001 },
  { name: "al", label: "Albumin", min: 0, max: 10, step: 1 },
  { name: "su", label: "Sugar", min: 0, max: 10, step: 1 },
  { name: "bgr", label: "Blood glucose random", min: 0, max: 2000, step: 0.1, unit: "mg/dL" },
  { name: "bu", label: "Blood urea", min: 0, max: 1000, step: 0.1, unit: "mg/dL" },
  { name: "sc", label: "Serum creatinine", min: 0, max: 100, step: 0.01, unit: "mg/dL" },
  { name: "sod", label: "Sodium", min: 0, max: 250, step: 0.1, unit: "mEq/L" },
  { name: "pot", label: "Potassium", min: 0, max: 30, step: 0.1, unit: "mEq/L" },
  { name: "hemo", label: "Hemoglobin", min: 0, max: 30, step: 0.1, unit: "g/dL" },
  { name: "pcv", label: "Packed cell volume", min: 0, max: 100, step: 1, unit: "%" },
  { name: "wbcc", label: "White blood cell count", min: 0, max: 200000, step: 1, unit: "cells/cumm" },
  { name: "rbcc", label: "Red blood cell count", min: 0, max: 20, step: 0.1, unit: "millions/cumm" },
];

const CATEGORICAL_FIELDS = [
  { name: "rbc", label: "Red blood cells", options: [["normal", "Normal"], ["abnormal", "Abnormal"]] },
  { name: "pc", label: "Pus cell", options: [["normal", "Normal"], ["abnormal", "Abnormal"]] },
  { name: "pcc", label: "Pus cell clumps", options: [["notpresent", "Not present"], ["present", "Present"]] },
  { name: "ba", label: "Bacteria", options: [["notpresent", "Not present"], ["present", "Present"]] },
  { name: "htn", label: "Hypertension", options: [["no", "No"], ["yes", "Yes"]] },
  { name: "dm", label: "Diabetes mellitus", options: [["no", "No"], ["yes", "Yes"]] },
  { name: "cad", label: "Coronary artery disease", options: [["no", "No"], ["yes", "Yes"]] },
  { name: "appet", label: "Appetite", options: [["good", "Good"], ["poor", "Poor"]] },
  { name: "pe", label: "Pedal edema", options: [["no", "No"], ["yes", "Yes"]] },
  { name: "ane", label: "Anemia", options: [["no", "No"], ["yes", "Yes"]] },
];

function riskClass(band) {
  const normalized = String(band || "").toLowerCase();
  if (normalized === "low") return "ckd-risk-low";
  if (normalized === "moderate") return "ckd-risk-moderate";
  return "ckd-risk-high";
}

export default function CKDPrediction() {
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

    const payload = {};
    for (const [key, value] of Object.entries(form)) {
      if (value === "" || value == null) {
        payload[key] = null;
      } else if (NUMERIC_FIELDS.some((field) => field.name === key)) {
        payload[key] = Number(value);
      } else {
        payload[key] = value;
      }
    }

    try {
      const token = localStorage.getItem("healthTwinToken");
      if (!token) {
        throw new Error("Your session is missing. Please log out and sign in again.");
      }

      const response = await fetch(`${API_URL}/predictions/ckd`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("healthTwinToken") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail =
          response.status === 401
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
          ? "Cannot connect to the API. Confirm FastAPI is running at http://127.0.0.1:8000."
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
    <section className="ckd-page">
      <style>{`
        .ckd-page { color: var(--text, #172033); }
        .ckd-hero { display:flex; align-items:flex-start; gap:14px; padding:22px; border:1px solid var(--border, #e3e8ef); border-radius:18px; background:var(--card, #fff); margin-bottom:20px; }
        .ckd-hero-icon { display:grid; place-items:center; flex:0 0 48px; width:48px; height:48px; border-radius:14px; background:#e8f5ee; color:#18794e; }
        .ckd-hero h2 { margin:0 0 6px; font-size:1.18rem; }
        .ckd-hero p { margin:0; color:var(--muted, #667085); line-height:1.55; }
        .ckd-layout { display:grid; grid-template-columns:minmax(0, 1.25fr) minmax(270px, .75fr); gap:20px; align-items:start; }
        .ckd-card { border:1px solid var(--border, #e3e8ef); border-radius:18px; padding:22px; background:var(--card, #fff); min-width:0; }
        .ckd-card h3 { margin:0 0 5px; font-size:1.05rem; }
        .ckd-muted { color:var(--muted, #667085); font-size:.9rem; line-height:1.5; margin:0 0 18px; }
        .ckd-section-title { font-size:.92rem; font-weight:750; margin:20px 0 12px; padding-bottom:8px; border-bottom:1px solid var(--border, #e3e8ef); }
        .ckd-fields { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:15px; }
        .ckd-field label { display:block; font-size:.88rem; font-weight:600; margin-bottom:7px; }
        .ckd-field input, .ckd-field select { box-sizing:border-box; width:100%; min-height:43px; border:1px solid var(--border, #d0d5dd); border-radius:10px; padding:10px 12px; background:var(--input-bg, #fff); color:inherit; font:inherit; }
        .ckd-field input:focus, .ckd-field select:focus { outline:2px solid #9bcdb4; outline-offset:1px; }
        .ckd-unit { display:block; margin-top:4px; color:var(--muted, #667085); font-size:.78rem; }
        .ckd-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:20px; }
        .ckd-button { border:0; border-radius:10px; padding:11px 16px; min-height:43px; font:inherit; font-weight:650; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; }
        .ckd-button-primary { background:#18794e; color:white; }
        .ckd-button-secondary { background:var(--surface-secondary, #f1f4f8); color:inherit; }
        .ckd-button:disabled { opacity:.65; cursor:wait; }
        .ckd-error { display:flex; gap:9px; padding:12px 14px; border-radius:10px; margin:0 0 16px; color:#9b1c1c; background:#fff0f0; line-height:1.45; }
        .ckd-placeholder { border:1px dashed var(--border, #d0d5dd); border-radius:14px; padding:25px 18px; text-align:center; color:var(--muted, #667085); }
        .ckd-placeholder svg { margin-bottom:10px; }
        .ckd-result { border:1px solid var(--border, #e3e8ef); border-radius:14px; padding:18px; }
        .ckd-result h4 { margin:0 0 12px; font-size:1rem; }
        .ckd-risk-pill { display:inline-flex; border-radius:999px; padding:6px 11px; font-size:.82rem; font-weight:700; margin-bottom:12px; }
        .ckd-risk-low { background:#e7f7ed; color:#17663c; }
        .ckd-risk-moderate { background:#fff4d6; color:#875d00; }
        .ckd-risk-high { background:#ffebeb; color:#a11b1b; }
        .ckd-score { font-size:2.1rem; font-weight:750; letter-spacing:-.04em; margin:0 0 8px; }
        .ckd-meter { height:9px; background:var(--surface-secondary, #edf0f4); border-radius:99px; overflow:hidden; margin:13px 0 17px; }
        .ckd-meter-fill { height:100%; background:#18794e; border-radius:99px; }
        .ckd-warning { font-size:.82rem; line-height:1.5; color:var(--muted, #667085); border-top:1px solid var(--border, #e3e8ef); padding-top:13px; margin:14px 0 0; }
        .ckd-safety { margin-top:18px; padding:14px 16px; border-radius:12px; background:#fff8e8; color:#744c00; font-size:.86rem; line-height:1.55; }
        @media (max-width: 850px) { .ckd-layout { grid-template-columns:1fr; } }
        @media (max-width: 520px) { .ckd-fields { grid-template-columns:1fr; } .ckd-card { padding:16px; } .ckd-hero { padding:16px; } }
      `}</style>

      <div className="ckd-hero">
        <div className="ckd-hero-icon"><Activity size={25} /></div>
        <div>
          <h2>Chronic Kidney Disease (CKD) Risk Estimation</h2>
          <p>Enter available clinical and laboratory measurements to request an experimental model estimate. Missing measurements can be left blank.</p>
        </div>
      </div>

      <div className="ckd-layout">
        <form className="ckd-card" onSubmit={handleSubmit}>
          <h3>Clinical inputs</h3>
          <p className="ckd-muted">Prefilled values are for demonstration only. Use actual measured values when available.</p>

          {error && (
            <div className="ckd-error" role="alert">
              <AlertCircle size={19} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="ckd-section-title">Numerical measurements</div>
          <div className="ckd-fields">
            {NUMERIC_FIELDS.map((field) => (
              <div className="ckd-field" key={field.name}>
                <label htmlFor={`ckd-${field.name}`}>{field.label}</label>
                <input
                  id={`ckd-${field.name}`}
                  name={field.name}
                  type="number"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder="Leave blank if unavailable"
                />
                {field.unit && <span className="ckd-unit">{field.unit}</span>}
              </div>
            ))}
          </div>

          <div className="ckd-section-title">Categorical measurements</div>
          <div className="ckd-fields">
            {CATEGORICAL_FIELDS.map((field) => (
              <div className="ckd-field" key={field.name}>
                <label htmlFor={`ckd-${field.name}`}>{field.label}</label>
                <select
                  id={`ckd-${field.name}`}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                >
                  <option value="">Unknown / not measured</option>
                  {field.options.map(([value, label]) => (
                    <option value={value} key={value}>{label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="ckd-actions">
            <button className="ckd-button ckd-button-primary" type="submit" disabled={loading}>
              {loading ? <><LoaderCircle size={17} /> Estimating…</> : <><CheckCircle2 size={17} /> Estimate CKD risk</>}
            </button>
            <button className="ckd-button ckd-button-secondary" type="button" onClick={resetForm} disabled={loading}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </form>

        <aside className="ckd-card" aria-live="polite">
          <h3>Prediction result</h3>
          <p className="ckd-muted">The result appears here after the API responds.</p>

          {!result ? (
            <div className="ckd-placeholder">
              <Activity size={30} aria-hidden="true" />
              <div style={{ fontWeight: 650, marginBottom: 5 }}>Ready for assessment</div>
              <div style={{ fontSize: ".88rem", lineHeight: 1.5 }}>Submit the form to request a model estimate.</div>
            </div>
          ) : (
            <div className="ckd-result">
              <h4>{result.condition || "CKD risk estimation"}</h4>
              <span className={`ckd-risk-pill ${riskClass(result.risk_band)}`}>
                {result.risk_band || "Result returned"} prototype band
              </span>
              <p className="ckd-score">{Number(result.risk_percentage).toFixed(2)}%</p>
              <div className="ckd-muted">Model score: {Number(result.risk_score).toFixed(4)} on a 0–1 scale</div>
              <div className="ckd-meter" aria-label={`Model score ${Number(result.risk_percentage).toFixed(2)} percent`}>
                <div className="ckd-meter-fill" style={{ width: `${Math.min(100, Math.max(0, Number(result.risk_percentage) || 0))}%` }} />
              </div>
              <div className="ckd-muted">Model: {result.model || "CKD model"}</div>
              <p className="ckd-warning">{result.disclaimer || "Research prototype only; not a diagnosis."}</p>
            </div>
          )}

          <div className="ckd-safety">
            <strong>Important:</strong> This experimental model score is not a diagnosis or a clinically calibrated probability. The model has not been clinically validated. Do not use it to make treatment decisions; discuss test results with a qualified healthcare professional.
          </div>
        </aside>
      </div>
    </section>
  );
}
