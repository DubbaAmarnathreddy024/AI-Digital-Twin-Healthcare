import { Brain, ClipboardList } from "lucide-react";
import { Card, Disclaimer, SectionHeader } from "../components/common";
import RadialGauge from "../components/RadialGauge";
import StatusBadge from "../components/StatusBadge";
import { MODEL_METRICS } from "../api";
import { NA } from "../utils/data";

export default function Prediction({ data }) {
  const { prediction, patient } = data;
  const model = prediction?.model ?? MODEL_METRICS.model;
  const prob = prediction?.probability ?? null;

  return (
    <div className="page">
      <Card className="prediction-hero">
        <div className="prediction-head">
          <SectionHeader icon={Brain} title="AI Health Risk Prediction" subtitle="Heart Disease · AI model prediction" />
          <StatusBadge tone="info">Research prototype</StatusBadge>
        </div>
        <div className="prediction-main">
          <RadialGauge value={prob} size={240} stroke={18} label="Probability" />
          <div className="prediction-side">
            <dl className="stat-list">
              <div>
                <dt>Probability</dt>
                <dd>{prob === null ? NA : `${prob.toFixed(1)}%`}</dd>
              </div>
              <div>
                <dt>Risk level</dt>
                <dd>{prediction?.riskLevel ?? NA}</dd>
              </div>
              <div>
                <dt>Prediction</dt>
                <dd>{prediction?.prediction ?? NA}</dd>
              </div>
            </dl>
            <p className="notice">Not a medical diagnosis. This is an AI model prediction from a research prototype.</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-2">
        <Card>
          <SectionHeader icon={Brain} title="Model" subtitle="Evaluation on the research dataset" />
          <dl className="kv-list spaced">
            <div className="kv-row">
              <dt>Model</dt>
              <dd>{model}</dd>
            </div>
            <div className="kv-row">
              <dt>ROC-AUC</dt>
              <dd>{prediction?.rocAuc ?? MODEL_METRICS.rocAuc}</dd>
            </div>
            <div className="kv-row">
              <dt>F1 score</dt>
              <dd>{prediction?.f1 ?? MODEL_METRICS.f1}</dd>
            </div>
          </dl>
          <p className="muted small">These figures describe model evaluation, not clinical performance.</p>
        </Card>

        <Card>
          <SectionHeader icon={ClipboardList} title="Prediction Summary" />
          <dl className="kv-list spaced">
            <div className="kv-row">
              <dt>Patient ID</dt>
              <dd>{patient.id || NA}</dd>
            </div>
            <div className="kv-row">
              <dt>Model</dt>
              <dd>{model}</dd>
            </div>
            <div className="kv-row">
              <dt>Probability</dt>
              <dd>{prob === null ? NA : `${prob.toFixed(1)}%`}</dd>
            </div>
            <div className="kv-row">
              <dt>Risk level</dt>
              <dd>{prediction?.riskLevel ?? NA}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Disclaimer>
        This application is an academic/research prototype for personalized healthcare monitoring and is not a
        medical diagnosis system.
      </Disclaimer>
    </div>
  );
}
