import { Footprints, HeartPulse, Droplets, Moon } from "lucide-react";
import MetricCard from "./MetricCard";
import { fmtNum, sleepUnit, vitalStatus } from "../utils/data";

export default function VitalCards({ latest }) {
  const hr = latest?.heartRate ?? null;
  const spo2 = latest?.spo2 ?? null;
  const steps = latest?.steps ?? null;
  const sleep = latest?.sleep ?? null;
  const hrS = vitalStatus("hr", hr);
  const spS = vitalStatus("spo2", spo2);
  const stS = vitalStatus("steps", steps);
  const slS = vitalStatus("sleep", sleep);

  return (
    <div className="grid grid-4">
      <MetricCard icon={HeartPulse} label="Heart Rate" value={hr} unit="BPM" status={hrS.text} tone={hrS.tone} />
      <MetricCard icon={Droplets} label="SpO2" value={spo2} unit="%" status={spS.text} tone={spS.tone} />
      <MetricCard
        icon={Footprints}
        label="Daily Steps"
        value={steps === null ? null : fmtNum(steps)}
        unit="steps"
        status={stS.text}
        tone={stS.tone}
      />
      <MetricCard
        icon={Moon}
        label="Sleep"
        value={sleep === null ? null : fmtNum(sleep, sleep % 1 ? 1 : 0)}
        unit={sleepUnit(sleep)}
        status={slS.text}
        tone={slS.tone}
      />
    </div>
  );
}
