import DataTable from "./DataTable";
import { fmtNum, fmtTime } from "../utils/data";

const cell = (v, d = 0) => (v === null || v === undefined ? "—" : fmtNum(v, d));

const COLUMNS = [
  { key: "ts", label: "Time", render: (r) => fmtTime(r.ts) },
  { key: "heartRate", label: "Heart Rate (BPM)", render: (r) => cell(r.heartRate) },
  { key: "spo2", label: "SpO2 (%)", render: (r) => cell(r.spo2) },
  { key: "steps", label: "Steps", render: (r) => cell(r.steps) },
  { key: "sleep", label: "Sleep", render: (r) => cell(r.sleep, r.sleep % 1 ? 1 : 0) },
  { key: "calories", label: "Calories", render: (r) => cell(r.calories, r.calories % 1 ? 1 : 0) },
];

export default function ReadingsTable({ readings, limit = 8 }) {
  const rows = [...readings].reverse().slice(0, limit); // newest first
  return <DataTable columns={COLUMNS} rows={rows} caption="Recent wearable readings" />;
}
