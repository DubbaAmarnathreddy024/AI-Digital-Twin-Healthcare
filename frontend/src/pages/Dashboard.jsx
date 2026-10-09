import { Activity, Brain, Database, Lightbulb, Network, ShieldCheck, Siren, Table2, User, Watch } from "lucide-react";
import { Card, Disclaimer, SectionHeader, summaryCount } from "../components/common";
import VitalCards from "../components/VitalCards";
import RadialGauge from "../components/RadialGauge";
import StatusBadge from "../components/StatusBadge";
import ReadingsTable from "../components/ReadingsTable";
import { AlertList } from "../components/AlertCard";
import FeatureBar from "../components/FeatureBar";
import { EmptyState } from "../components/common";
import { MODEL_METRICS } from "../api";
import { NA } from "../utils/data";

export default function Dashboard({ data, onNavigate }) {
  const { patient, twin, monitoring, prediction, features, twinView } = data;
  const attention = monitoring.alerts.length > 0;
  const topFeatures = features.slice(0, 6);
  const maxF = topFeatures.length ? Math.abs(topFeatures[0].value) : 0;

  return (
    <div className="page">
      <Card className="overview">
        <div className="overview-main">
          <span className="avatar avatar-lg" aria-hidden="true">
            {(patient.name || "P").slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="muted small">Patient overview</p>
            <h2 className="overview-name">{patient.name || NA}</h2>
          </div>
        </div>
        <dl className="overview-facts">
          <div>
            <dt>Patient ID</dt>
            <dd>{patient.id || NA}</dd>
          </div>
          <div>
            <dt>Age</dt>
            <dd>{patient.age ?? NA}</dd>
          </div>
          <div>
            <dt>Sex</dt>
            <dd>{patient.sex ?? NA}</dd>
          </div>
          <div>
            <dt>Digital Twin</dt>
            <dd>
              <StatusBadge tone={twinView.loaded ? "success" : "neutral"} dot>
                {twinView.loaded ? twinView.status || "Available" : NA}
              </StatusBadge>
            </dd>
          </div>
        </dl>
      </Card>

      <VitalCards latest={monitoring.latest} />

      <div className="grid grid-2">
        <Card>
          <SectionHeader icon={Brain} title="AI Health Risk" subtitle="Heart disease risk · AI model prediction" />
          <div className="risk-layout">
            <RadialGauge value={prediction?.probability ?? null} />
            <div className="risk-details">
              <dl className="stat-list">
                <div>
                  <dt>Risk level</dt>
                  <dd>{prediction?.riskLevel ?? NA}</dd>
                </div>
                <div>
                  <dt>Model</dt>
                  <dd>{prediction?.model ?? MODEL_METRICS.model}</dd>
                </div>
                <div>
                  <dt>ROC-AUC</dt>
                  <dd>{prediction?.rocAuc ?? MODEL_METRICS.rocAuc}</dd>
                </div>
                <div>
                  <dt>F1 score</dt>
                  <dd>{prediction?.f1 ?? MODEL_METRICS.f1}</dd>
                </div>
              </dl>
              <p className="muted small">
                ROC-AUC and F1 are evaluation figures from the research dataset, not clinical performance.
              </p>
              <button className="link-btn" onClick={() => onNavigate("prediction")}>
                View prediction details
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader icon={Watch} title="Monitoring status" subtitle="Wearable simulator · refreshed every 5 seconds" />
          <div className={`status-panel ${attention ? "attention" : "normal"}`}>
            <ShieldCheck size={26} aria-hidden="true" />
            <div>
              <p className="status-panel-title">{attention ? "Attention Required" : "Monitoring Normal"}</p>
              <p className="muted small">
                {attention ? "One or more alerts were raised." : "No alerts raised by the configured settings."}
              </p>
            </div>
          </div>
          <dl className="stat-list two">
            <div>
              <dt>Wearable readings</dt>
              <dd>{monitoring.readingCount}</dd>
            </div>
            <div>
              <dt>Alerts</dt>
              <dd>{monitoring.alerts.length}</dd>
            </div>
          </dl>
          <button className="link-btn" onClick={() => onNavigate("monitoring")}>
            Open live monitoring
          </button>
        </Card>
      </div>

      <div className="grid grid-2-wide">
        <Card>
          <SectionHeader icon={Table2} title="Recent wearable readings" subtitle="Newest first" />
          <ReadingsTable readings={monitoring.readings} limit={6} />
        </Card>

        <Card>
          <SectionHeader icon={Siren} title="Health alerts" subtitle="Latest alerts" />
          <AlertList alerts={monitoring.alerts} limit={4} />
        </Card>
      </div>

      <div className="grid grid-2">
        <Card>
          <SectionHeader icon={Network} title="Digital Twin summary" subtitle="Data held by the patient twin" />
          <div className="mini-grid">
            <div className="mini-tile">
              <Database size={16} aria-hidden="true" />
              <p className="mini-value">{summaryCount(twin?.clinical_data ?? twinView.clinical)}</p>
              <p className="mini-label">Clinical Data</p>
            </div>
            <div className="mini-tile">
              <Watch size={16} aria-hidden="true" />
              <p className="mini-value">{summaryCount(twinView.wearable)}</p>
              <p className="mini-label">Wearable Data</p>
            </div>
            <div className="mini-tile">
              <Brain size={16} aria-hidden="true" />
              <p className="mini-value">{summaryCount(twinView.predictions)}</p>
              <p className="mini-label">AI Predictions</p>
            </div>
            <div className="mini-tile">
              <Activity size={16} aria-hidden="true" />
              <p className="mini-value">{summaryCount(twinView.snapshots)}</p>
              <p className="mini-label">Health Snapshots</p>
            </div>
          </div>
          <button className="link-btn" onClick={() => onNavigate("twin")}>
            Open Digital Twin
          </button>
        </Card>

        <Card>
          <SectionHeader icon={Lightbulb} title="Explainable AI preview" subtitle="Top SHAP features" />
          {topFeatures.length ? (
            <ul className="feature-list">
              {topFeatures.map((f, i) => (
                <FeatureBar key={f.name} name={f.name} value={f.value} max={maxF} rank={i + 1} />
              ))}
            </ul>
          ) : (
            <EmptyState icon={Lightbulb}>Not Available</EmptyState>
          )}
          <button className="link-btn" onClick={() => onNavigate("xai")}>
            See all features
          </button>
        </Card>
      </div>

      <Disclaimer>
        This application is an academic/research prototype for personalized healthcare monitoring and is not a
        medical diagnosis system.
      </Disclaimer>
    </div>
  );
}
