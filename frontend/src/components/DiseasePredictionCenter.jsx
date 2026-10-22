import {
  Activity,
  ArrowRight,
  Brain,
  Droplets,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

const MODULES = [
  {
    id: "prediction",
    title: "Heart Disease",
    eyebrow: "CARDIOVASCULAR",
    description:
      "Open the existing heart-disease prediction dashboard and review its model estimate and evaluation details.",
    icon: HeartPulse,
    tone: "heart",
    action: "Open heart disease",
    note: "Uses the existing HealthTwin heart model view",
  },
  {
    id: "diabetes",
    title: "Diabetes Risk",
    eyebrow: "METABOLIC HEALTH",
    description:
      "Enter the eight supported clinical features to request an experimental diabetes risk estimate.",
    icon: Droplets,
    tone: "diabetes",
    action: "Open diabetes prediction",
    note: "8 model inputs · FastAPI prediction endpoint",
  },
  {
    id: "ckd",
    title: "Kidney Disease (CKD)",
    eyebrow: "KIDNEY HEALTH",
    description:
      "Use available laboratory and clinical measurements to request an experimental CKD model estimate.",
    icon: Activity,
    tone: "kidney",
    action: "Open CKD prediction",
    note: "24 original dataset features · Missing values supported",
  },
];

export default function DiseasePredictionCenter({ onNavigate }) {
  return (
    <section className="dpc-page">
      <style>{`
        .dpc-page { color:var(--text,#172033); }
        .dpc-hero { position:relative; overflow:hidden; display:flex; align-items:flex-start; gap:18px; padding:26px; border:1px solid var(--border,#e3e8ef); border-radius:20px; background:var(--card,#fff); margin-bottom:22px; }
        .dpc-hero-icon { display:grid; place-items:center; flex:0 0 54px; width:54px; height:54px; border-radius:16px; background:#e9eefc; color:#344db8; }
        .dpc-hero h2 { margin:0 0 8px; font-size:clamp(1.2rem,2vw,1.55rem); }
        .dpc-hero p { max-width:760px; margin:0; color:var(--muted,#667085); line-height:1.65; }
        .dpc-hero-tag { display:inline-flex; align-items:center; gap:7px; margin-top:14px; padding:6px 10px; border:1px solid var(--border,#e3e8ef); border-radius:999px; font-size:.78rem; font-weight:650; color:var(--muted,#667085); }
        .dpc-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:17px; align-items:stretch; }
        .dpc-card { display:flex; flex-direction:column; min-width:0; padding:22px; border:1px solid var(--border,#e3e8ef); border-radius:18px; background:var(--card,#fff); box-shadow:0 4px 16px rgba(16,24,40,.035); }
        .dpc-card-top { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
        .dpc-icon { display:grid; place-items:center; width:46px; height:46px; border-radius:14px; }
        .dpc-icon.heart { background:#ffebeb; color:#b42318; }
        .dpc-icon.diabetes { background:#e8f5ee; color:#18794e; }
        .dpc-icon.kidney { background:#eaf2ff; color:#245bb2; }
        .dpc-eyebrow { font-size:.68rem; letter-spacing:.075em; font-weight:800; color:var(--muted,#667085); text-align:right; }
        .dpc-card h3 { margin:0 0 9px; font-size:1.1rem; }
        .dpc-card p { margin:0; color:var(--muted,#667085); font-size:.9rem; line-height:1.6; }
        .dpc-note { margin-top:16px; padding-top:13px; border-top:1px solid var(--border,#e3e8ef); font-size:.78rem; line-height:1.45; color:var(--muted,#667085); }
        .dpc-action { display:flex; align-items:center; justify-content:space-between; gap:10px; width:100%; margin-top:auto; padding:12px 14px; border:0; border-radius:11px; background:var(--surface-secondary,#f1f4f8); color:var(--text,#172033); font:inherit; font-size:.86rem; font-weight:700; cursor:pointer; text-align:left; }
        .dpc-action:hover { filter:brightness(.97); }
        .dpc-safety { display:flex; gap:11px; margin-top:20px; padding:15px 17px; border:1px solid #f0dfb5; border-radius:14px; background:#fff8e8; color:#744c00; font-size:.85rem; line-height:1.6; }
        .dpc-safety svg { flex:0 0 auto; margin-top:2px; }
        .dpc-safety strong { display:block; margin-bottom:2px; }
        @media (max-width:1050px) { .dpc-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media (max-width:680px) { .dpc-grid { grid-template-columns:1fr; } .dpc-hero { padding:18px; } .dpc-card { padding:18px; } }
      `}</style>

      <div className="dpc-hero">
        <div className="dpc-hero-icon"><Brain size={27} /></div>
        <div>
          <h2>Unified Disease Prediction Center</h2>
          <p>
            Access HealthTwin's existing heart-disease view and the diabetes and
            chronic kidney disease (CKD) prediction modules from one place. Select
            a module below to enter its dedicated workflow.
          </p>
          <div className="dpc-hero-tag"><ShieldCheck size={15} /> Research prototype · Not for diagnosis</div>
        </div>
      </div>

      <div className="dpc-grid">
        {MODULES.map(({ id, title, eyebrow, description, icon: Icon, tone, action, note }) => (
          <article className="dpc-card" key={id}>
            <div className="dpc-card-top">
              <div className={`dpc-icon ${tone}`}><Icon size={24} /></div>
              <span className="dpc-eyebrow">{eyebrow}</span>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className="dpc-note">{note}</div>
            <button className="dpc-action" type="button" onClick={() => onNavigate?.(id)}>
              <span>{action}</span><ArrowRight size={17} />
            </button>
          </article>
        ))}
      </div>

      <div className="dpc-safety" role="note">
        <ShieldCheck size={19} aria-hidden="true" />
        <div>
          <strong>Clinical safety notice</strong>
          These outputs are experimental machine-learning estimates from research
          datasets, not clinically validated diagnoses or calibrated probabilities.
          Do not use them to make treatment decisions. Consult a qualified healthcare
          professional for medical interpretation.
        </div>
      </div>
    </section>
  );
}
