import {
  Activity,
  ArrowDown,
  Brain,
  ClipboardList,
  Database,
  FlaskConical,
  RefreshCw,
  Siren,
  Stethoscope,
  Watch,
} from "lucide-react";

import {
  Card,
  DataBlock,
  Disclaimer,
  SectionHeader,
} from "../components/common";

import StatusBadge from "../components/StatusBadge";
import {
  NA,
  fmtDateTime,
  fmtNum,
} from "../utils/data";


function TwinCard({ icon: Icon, title, value }) {
  return (
    <Card className="twin-card">
      <SectionHeader icon={Icon} title={title} />
      <DataBlock value={value} />
    </Card>
  );
}


function WearableStateCard({ latest }) {

  if (!latest) {
    return (
      <TwinCard
        icon={ClipboardList}
        title="Wearable State"
        value={null}
      />
    );
  }

  const state = {
    heart_rate: latest.heartRate,
    spo2: latest.spo2,
    steps: latest.steps,
    sleep_hours: latest.sleep,
    calories: latest.calories,
    timestamp: latest.ts,
  };

  return (
    <Card className="twin-card">
      <SectionHeader
        icon={ClipboardList}
        title="Latest Wearable State"
        subtitle="Most recent recorded reading"
      />

      <div className="mini-grid">
        <div className="mini-tile">
          <p className="mini-value">
            {fmtNum(state.heart_rate)}
          </p>
          <p className="mini-label">Heart Rate</p>
        </div>

        <div className="mini-tile">
          <p className="mini-value">
            {fmtNum(state.spo2)}
          </p>
          <p className="mini-label">SpO₂</p>
        </div>

        <div className="mini-tile">
          <p className="mini-value">
            {fmtNum(state.steps)}
          </p>
          <p className="mini-label">Steps</p>
        </div>

        <div className="mini-tile">
          <p className="mini-value">
            {state.sleep_hours !== null && state.sleep_hours !== undefined
              ? `${fmtNum(state.sleep_hours, 1)} hrs`
              : NA}
          </p>
          <p className="mini-label">Sleep</p>
        </div>
      </div>

      {state.timestamp && (
        <p className="muted small" style={{ marginTop: 12 }}>
          Recorded: {fmtDateTime(state.timestamp)}
        </p>
      )}
    </Card>
  );
}


export default function DigitalTwin({ data }) {

  const {
    patient,
    twinView,
    monitoring,
    online,
    lastUpdated,
  } = data;

  const syncText =
    twinView.sync ||
    (online ? "Live polling active" : "Not synchronized");

  const updated =
    twinView.lastUpdated ||
    lastUpdated;

  const latest =
    monitoring?.latest || null;

  const alertCount =
    monitoring?.alerts?.length ?? 0;

  return (
    <div className="page">

      {/* Twin Status */}
      <Card className="twin-status">

        <div className="twin-status-item">
          <p className="muted small">
            Patient
          </p>

          <p className="twin-status-value">
            {patient.name || NA}
          </p>
        </div>


        <div className="twin-status-item">

          <p className="muted small">
            Twin status
          </p>

          <StatusBadge
            tone={
              twinView.loaded
                ? "success"
                : "neutral"
            }
            dot
          >
            {twinView.loaded
              ? twinView.status || "Available"
              : NA}
          </StatusBadge>

        </div>


        <div className="twin-status-item">

          <p className="muted small">
            Synchronization
          </p>

          <StatusBadge
            tone={
              online
                ? "success"
                : "warning"
            }
            dot
            pulse={online}
          >
            <RefreshCw
              size={12}
              aria-hidden="true"
            />

            {syncText}
          </StatusBadge>

        </div>


        <div className="twin-status-item">

          <p className="muted small">
            Last updated
          </p>

          <p className="twin-status-value">
            {updated
              ? fmtDateTime(updated)
              : NA}
          </p>

        </div>

      </Card>


      {/* Digital Twin Flow */}
      <Card>

        <SectionHeader
          title="How the Digital Twin works"
          subtitle="From the real patient to continuous monitoring"
        />

        <div
          className="flow"
          role="list"
        >

          <div
            className="flow-node"
            role="listitem"
          >
            <span className="flow-title">
              Real Patient
            </span>

            <span className="muted small">
              {patient.id || NA}
            </span>
          </div>


          <ArrowDown
            className="flow-arrow"
            size={20}
            aria-hidden="true"
          />


          <div
            className="flow-node flow-wide"
            role="listitem"
          >

            <span className="flow-title">
              Clinical + Wearable + AI Data
            </span>

            <div className="flow-chips">

              <span className="chip">
                <Database
                  size={13}
                  aria-hidden="true"
                />
                Clinical
              </span>

              <span className="chip">
                <Watch
                  size={13}
                  aria-hidden="true"
                />
                Wearable
              </span>

              <span className="chip">
                <Brain
                  size={13}
                  aria-hidden="true"
                />
                AI
              </span>

            </div>

          </div>


          <ArrowDown
            className="flow-arrow"
            size={20}
            aria-hidden="true"
          />


          <div
            className="flow-node flow-core"
            role="listitem"
          >

            <span className="flow-title">
              Digital Twin
            </span>

            <span className="small">
              Patient-specific virtual model
            </span>

          </div>


          <ArrowDown
            className="flow-arrow"
            size={20}
            aria-hidden="true"
          />


          <div
            className="flow-node"
            role="listitem"
          >

            <span className="flow-title">
              Continuous Monitoring
            </span>

            <span className="muted small">
              {monitoring.readingCount} readings · every 5 seconds
            </span>

          </div>

        </div>

      </Card>


      {/* Core Digital Twin Data */}
      <div className="grid grid-2">

        <TwinCard
          icon={Database}
          title="Clinical Data"
          value={twinView.clinical}
        />

        <TwinCard
          icon={Watch}
          title="Wearable Data"
          value={twinView.wearable}
        />

        <TwinCard
          icon={Brain}
          title="AI Predictions"
          value={twinView.predictions}
        />

        <TwinCard
          icon={Activity}
          title="Health Snapshots"
          value={twinView.snapshots}
        />

        <TwinCard
          icon={Stethoscope}
          title="Medical History"
          value={twinView.history}
        />

        <TwinCard
          icon={FlaskConical}
          title="Lab Results"
          value={twinView.labs}
        />


        {/* Alerts */}
        <Card className="twin-card">

          <SectionHeader
            icon={Siren}
            title="Alerts"
            subtitle="Current monitoring alerts"
          />

          <div className="mini-grid">

            <div className="mini-tile">

              <p className="mini-value">
                {alertCount}
              </p>

              <p className="mini-label">
                Active Alerts
              </p>

            </div>

          </div>

          <p className="muted small">
            {alertCount === 0
              ? "No alerts raised by the configured monitoring settings."
              : "One or more monitoring alerts require attention."}
          </p>

        </Card>


        {/* Latest Wearable State */}
        <WearableStateCard
          latest={latest}
        />

      </div>


      <Disclaimer>
        This application is an academic/research prototype for personalized
        healthcare monitoring and is not a medical diagnosis system.
      </Disclaimer>

    </div>
  );
}