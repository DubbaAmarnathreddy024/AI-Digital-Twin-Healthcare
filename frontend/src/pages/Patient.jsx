import { Brain, Network, User, Watch } from "lucide-react";
import { Card, Disclaimer, SectionHeader } from "../components/common";
import StatusBadge from "../components/StatusBadge";
import { NA, initials } from "../utils/data";

export default function Patient({ data }) {
  const { patient, twinView, monitoring, prediction, errors } = data;
  const monitoringOk = !errors.monitoring && monitoring.readingCount > 0;

  return (
    <div className="page">
      <Card className="profile-hero">
        <span className="avatar avatar-xl" aria-hidden="true">
          {initials(patient.name)}
        </span>
        <div>
          <h2 className="profile-name">{patient.name || NA}</h2>
          <dl className="profile-facts">
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
          </dl>
        </div>
      </Card>

      <div className="grid grid-2">
        <Card>
          <SectionHeader icon={User} title="Patient Information" subtitle="Fields returned by the patient record" />
          <dl className="kv-list spaced">
            <div className="kv-row">
              <dt>Name</dt>
              <dd>{patient.name || NA}</dd>
            </div>
            <div className="kv-row">
              <dt>Patient ID</dt>
              <dd>{patient.id || NA}</dd>
            </div>
            <div className="kv-row">
              <dt>Age</dt>
              <dd>{patient.age ?? NA}</dd>
            </div>
            <div className="kv-row">
              <dt>Sex</dt>
              <dd>{patient.sex ?? NA}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <SectionHeader icon={Network} title="Digital Twin Status" subtitle="Virtual model of this patient" />
          <div className="status-line">
            <StatusBadge tone={twinView.loaded ? "success" : "neutral"} dot>
              {twinView.loaded ? twinView.status || "Available" : NA}
            </StatusBadge>
          </div>
          <p className="muted">
            {twinView.loaded
              ? "The Digital Twin record was loaded from the backend."
              : "The Digital Twin record could not be loaded."}
          </p>
        </Card>

        <Card>
          <SectionHeader icon={Watch} title="Monitoring Connection" subtitle="Wearable data feed" />
          <div className="status-line">
            <StatusBadge tone={monitoringOk ? "success" : "warning"} dot pulse={monitoringOk}>
              {monitoringOk ? "Receiving readings" : "No readings"}
            </StatusBadge>
          </div>
          <p className="muted">
            {monitoringOk
              ? `${monitoring.readingCount} wearable readings available. Data refreshes every 5 seconds.`
              : "No wearable readings available."}
          </p>
        </Card>

        <Card>
          <SectionHeader icon={Brain} title="AI Analysis Availability" subtitle="Heart disease model" />
          <div className="status-line">
            <StatusBadge tone={prediction ? "success" : "neutral"} dot>
              {prediction ? "Prediction available" : NA}
            </StatusBadge>
          </div>
          <p className="muted">
            {prediction
              ? "A Random Forest prediction is attached to the Digital Twin."
              : "No AI prediction is attached to the Digital Twin."}
          </p>
        </Card>
      </div>

      <Disclaimer>
        This application is an academic/research prototype for personalized healthcare monitoring and is not a
        medical diagnosis system.
      </Disclaimer>
    </div>
  );
}
