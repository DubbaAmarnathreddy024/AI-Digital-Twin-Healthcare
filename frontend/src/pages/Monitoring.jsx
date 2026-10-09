import { Activity, Clock, Siren, Table2, Watch } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, Disclaimer, SectionHeader } from "../components/common";
import VitalCards from "../components/VitalCards";
import ChartCard from "../components/ChartCard";
import StatusBadge from "../components/StatusBadge";
import ReadingsTable from "../components/ReadingsTable";
import { AlertList } from "../components/AlertCard";
import { fmtTime } from "../utils/data";

const MAX_POINTS = 40;

function LiveChart({ points, dataKey, name, color, unit, domain }) {
  const gid = `grad-${dataKey}`;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e6ebf2" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={32} />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} domain={domain || ["auto", "auto"]} width={44} />
        <Tooltip
          formatter={(v) => [`${v}${unit ? ` ${unit}` : ""}`, name]}
          contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gid})`}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive
          animationDuration={400}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Monitoring({ data }) {
  const { monitoring, online, lastUpdated } = data;
  const attention = monitoring.alerts.length > 0;

  const points = monitoring.readings.slice(-MAX_POINTS).map((r, i) => ({
    label: r.ts ? fmtTime(r.ts) : `#${i + 1}`,
    heartRate: r.heartRate,
    spo2: r.spo2,
    steps: r.steps,
  }));
  const has = (k) => points.some((p) => p[k] !== null && p[k] !== undefined);

  return (
    <div className="page">
      <Card className="live-strip">
        <div className="live-item">
          <Watch size={18} aria-hidden="true" />
          <div>
            <p className="muted small">Live monitoring</p>
            <StatusBadge tone={online ? "success" : "danger"} dot pulse={online}>
              {online ? "Live" : "Offline"}
            </StatusBadge>
          </div>
        </div>
        <div className="live-item">
          <Clock size={18} aria-hidden="true" />
          <div>
            <p className="muted small">Last updated</p>
            <p className="live-value">{lastUpdated ? fmtTime(lastUpdated) : "Not Available"}</p>
          </div>
        </div>
        <div className="live-item">
          <Activity size={18} aria-hidden="true" />
          <div>
            <p className="muted small">Readings</p>
            <p className="live-value">{monitoring.readingCount}</p>
          </div>
        </div>
        <div className="live-item">
          <Siren size={18} aria-hidden="true" />
          <div>
            <p className="muted small">Alerts</p>
            <p className="live-value">
              {monitoring.alerts.length}{" "}
              <StatusBadge tone={attention ? "warning" : "success"}>
                {attention ? "Attention Required" : "Normal"}
              </StatusBadge>
            </p>
          </div>
        </div>
      </Card>

      <VitalCards latest={monitoring.latest} />

      <div className="grid grid-2">
        <ChartCard title="Heart rate over time" subtitle="BPM" hasData={has("heartRate")}>
          <LiveChart points={points} dataKey="heartRate" name="Heart rate" color="#2563eb" unit="BPM" />
        </ChartCard>
        <ChartCard title="SpO2 over time" subtitle="%" hasData={has("spo2")}>
          <LiveChart points={points} dataKey="spo2" name="SpO2" color="#0f9d77" unit="%" domain={["dataMin - 2", 100]} />
        </ChartCard>
      </div>
      <ChartCard title="Steps over time" subtitle="steps" hasData={has("steps")}>
        <LiveChart points={points} dataKey="steps" name="Steps" color="#7c5cdb" unit="steps" />
      </ChartCard>

      <Card>
        <SectionHeader icon={Table2} title="Wearable history" subtitle="Newest first · latest 15 readings" />
        <ReadingsTable readings={monitoring.readings} limit={15} />
      </Card>

      <Card>
        <SectionHeader icon={Siren} title="Alert timeline" subtitle="Recent alerts" />
        <AlertList alerts={monitoring.alerts} limit={10} />
      </Card>

      <Disclaimer>
        Configured monitoring thresholds are prototype settings and are not clinical diagnostic thresholds.
      </Disclaimer>
      <Disclaimer>
        This application is an academic/research prototype for personalized healthcare monitoring and is not a
        medical diagnosis system.
      </Disclaimer>
    </div>
  );
}
