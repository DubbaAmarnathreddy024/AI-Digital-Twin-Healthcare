// Defensive helpers: they only read what the API really returns.
// Nothing here creates medical data. Missing values stay null and the UI shows "Not Available".

export const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export function pick(obj, keys, fallback = undefined) {
  if (!isObj(obj)) return fallback;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return fallback;
}

export function pickArray(obj, keys) {
  if (Array.isArray(obj)) return obj;
  if (!isObj(obj)) return [];
  for (const k of keys) {
    if (Array.isArray(obj[k])) return obj[k];
  }
  return [];
}

export const toNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const NA = "Not Available";

export function fmtNum(n, digits = 0) {
  if (n === null || n === undefined) return NA;
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtTime(ts) {
  if (!ts) return NA;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function fmtDateTime(ts) {
  if (!ts) return NA;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function initials(name) {
  if (!name || typeof name !== "string") return "P";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "P";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function countOf(v) {
  if (Array.isArray(v)) return v.length;
  if (isObj(v)) return Object.keys(v).length;
  return null;
}

export function isEmptyValue(v) {
  if (v === null || v === undefined || v === "") return true;
  if (Array.isArray(v)) return v.length === 0;
  if (isObj(v)) return Object.keys(v).length === 0;
  return false;
}

/* ---------------- Patient ---------------- */

export function normalizePatient(patient, twin) {
  const src = isObj(patient) ? patient : {};
  const fromTwin = isObj(twin) && isObj(twin.patient) ? twin.patient : {};
  const get = (keys) => pick(src, keys, pick(fromTwin, keys, null));
  return {
    name: get(["name", "full_name", "patient_name", "fullName"]),
    id: get(["patient_id", "id", "patientId"]),
    age: get(["age"]),
    sex: get(["sex", "gender"]),
    raw: src,
  };
}

/* ---------------- Monitoring ---------------- */

const TIME_KEYS = ["timestamp", "created_at", "recorded_at", "time", "datetime", "date"];

export function normalizeReading(r) {
  const ts = pick(r, TIME_KEYS, null);
  return {
    ts,
    t: ts ? Date.parse(ts) : NaN,
    heartRate: toNum(pick(r, ["heart_rate", "heartRate", "hr", "heartrate"])),
    spo2: toNum(pick(r, ["spo2", "SpO2", "spO2", "oxygen_saturation"])),
    steps: toNum(pick(r, ["steps", "step_count"])),
    sleep: toNum(pick(r, ["sleep", "sleep_hours", "sleep_duration", "sleepHours"])),
    calories: toNum(pick(r, ["calories", "calories_burned", "kcal"])),
  };
}

export function normalizeAlert(a, i = 0) {
  if (typeof a === "string") return { id: i, message: a, severity: null, ts: null };
  if (!isObj(a)) return { id: i, message: String(a), severity: null, ts: null };
  const message =
    pick(a, ["message", "alert_message", "description", "title", "text", "alert", "type"]) ||
    JSON.stringify(a);
  return {
    id: pick(a, ["id", "alert_id"], i),
    message: String(message),
    severity: pick(a, ["severity", "level", "priority", "alert_type"], null),
    ts: pick(a, TIME_KEYS, null),
    metric: pick(a, ["metric", "vital", "parameter"], null),
  };
}

export function alertTone(severity) {
  const s = String(severity || "").toLowerCase();
  if (/crit|high|danger|severe|red|urgent/.test(s)) return "danger";
  if (/warn|med|moderate|amber|orange/.test(s)) return "warning";
  return "info";
}

export function normalizeMonitoring(m) {
  let rawReadings = pickArray(m, [
    "readings",
    "history",
    "wearable_history",
    "wearable_readings",
    "wearable_data",
    "data",
    "items",
    "records",
  ]);
  if (!rawReadings.length && isObj(m)) {
    const firstArr = Object.entries(m).find(
      ([k, v]) => k !== "alerts" && Array.isArray(v) && v.length && isObj(v[0])
    );
    if (firstArr) rawReadings = firstArr[1];
  }

  let readings = rawReadings.filter(isObj).map(normalizeReading);
  const allTimed = readings.length > 0 && readings.every((r) => Number.isFinite(r.t));
  if (allTimed) readings = [...readings].sort((a, b) => a.t - b.t);

  const latestRaw = pick(m, ["latest", "latest_reading", "current", "current_reading"], null);
  const latest = readings.length
    ? readings[readings.length - 1]
    : isObj(latestRaw)
    ? normalizeReading(latestRaw)
    : null;

  const alerts = pickArray(m, ["alerts", "recent_alerts", "alert_history", "active_alerts"]).map(
    normalizeAlert
  );

  const reportedCount = toNum(pick(m, ["reading_count", "readings_count", "total_readings"]));
  return {
    readings,
    latest,
    alerts,
    readingCount: reportedCount !== null ? reportedCount : readings.length,
    status: pick(m, ["status", "monitoring_status"], null),
  };
}

/* Prototype display labels only. These are NOT clinical thresholds. */
export function vitalStatus(kind, value) {
  if (value === null || value === undefined) return { text: "No data", tone: "neutral" };
  if (kind === "hr") {
    if (value >= 60 && value <= 100) return { text: "Normal", tone: "success" };
    return { text: "Outside usual range", tone: "warning" };
  }
  if (kind === "spo2") {
    if (value >= 95) return { text: "Normal", tone: "success" };
    return { text: "Below usual range", tone: "warning" };
  }
  if (kind === "steps") return { text: "Latest recorded count", tone: "info" };
  if (kind === "sleep") return { text: "Latest recorded sleep", tone: "info" };
  return { text: "Recorded", tone: "info" };
}

export function sleepUnit(v) {
  if (v === null || v === undefined) return "";
  return v <= 24 ? "hrs" : "min";
}

/* ---------------- Digital twin ---------------- */

export function normalizeTwin(twin) {
  const t = isObj(twin) ? twin : {};
  return {
    loaded: isObj(twin),
    status: pick(t, ["status", "twin_status", "state"], null),
    sync: pick(t, ["sync_status", "synchronization_status", "synchronization", "sync"], null),
    lastUpdated: pick(
      t,
      ["updated_at", "last_updated", "last_synced", "last_sync", "timestamp", "created_at"],
      null
    ),
    clinical: pick(t, ["clinical_data", "clinicalData", "clinical"], null),
    wearable: pick(t, ["wearable_data", "wearableData", "wearable"], null),
    predictions: pick(t, ["ai_predictions", "aiPredictions", "predictions", "ai_prediction", "prediction"], null),
    snapshots: pick(t, ["health_snapshots", "healthSnapshots", "snapshots"], null),
    history: pick(t, ["medical_history", "medicalHistory"], null),
    labs: pick(t, ["lab_results", "labResults", "labs"], null),
    alerts: pick(t, ["alerts"], null),
    wearableState: pick(t, ["wearable_state", "wearableState"], null),
  };
}

/* ---------------- AI prediction ---------------- */

const PROB_KEYS = [
  "probability",
  "risk_probability",
  "heart_disease_probability",
  "heart_disease_risk",
  "risk_score",
  "score",
];

function findPrediction(src) {
  if (Array.isArray(src)) {
    const objs = src.filter(isObj);
    if (!objs.length) return null;
    const timed = objs.filter((o) => Number.isFinite(Date.parse(pick(o, TIME_KEYS, ""))));
    if (timed.length === objs.length) {
      return objs.reduce((a, b) =>
        Date.parse(pick(a, TIME_KEYS)) >= Date.parse(pick(b, TIME_KEYS)) ? a : b
      );
    }
    return objs[0];
  }
  if (isObj(src)) {
    if (PROB_KEYS.some((k) => src[k] !== undefined)) return src;
    for (const v of Object.values(src)) {
      if (Array.isArray(v) || isObj(v)) {
        const found = findPrediction(v);
        if (found) return found;
      }
    }
  }
  return null;
}

export function normalizePrediction(twin) {
  const t = isObj(twin) ? twin : {};
  const src = pick(t, ["ai_predictions", "aiPredictions", "predictions", "ai_prediction", "prediction"], null);
  const p = findPrediction(src);
  if (!p) return null;

  let prob = toNum(pick(p, PROB_KEYS));
  if (prob !== null && prob <= 1) prob = prob * 100;

  const predRaw = pick(p, ["prediction", "predicted_class", "predicted_label", "label", "result"], null);
  let prediction = predRaw;
  if (predRaw === 1 || predRaw === "1" || predRaw === true) prediction = "Positive class (1)";
  if (predRaw === 0 || predRaw === "0" || predRaw === false) prediction = "Negative class (0)";

  return {
    probability: prob,
    riskLevel: pick(p, ["risk_level", "risk", "risk_category", "level"], null),
    prediction,
    model: pick(p, ["model", "model_name"], null),
    rocAuc: pick(p, ["roc_auc", "rocAuc", "auc"], null),
    f1: pick(p, ["f1", "f1_score"], null),
    ts: pick(p, TIME_KEYS, null),
  };
}

/* ---------------- SHAP ---------------- */

export function normalizeFeatures(data) {
  let src = data;
  if (isObj(src)) {
    const nested = pick(src, [
      "features",
      "feature_importance",
      "shap_values",
      "importance",
      "top_features",
      "explanations",
      "data",
    ]);
    if (nested !== undefined) src = nested;
  }

  let items = [];
  if (Array.isArray(src)) {
    items = src
      .map((x) => {
        if (Array.isArray(x)) return { name: String(x[0]), value: toNum(x[1]) };
        if (isObj(x)) {
          return {
            name: pick(x, ["feature", "name", "feature_name", "label"]),
            value: toNum(
              pick(x, ["importance", "shap_value", "shap", "mean_abs_shap", "value", "score", "contribution"])
            ),
          };
        }
        return null;
      })
      .filter((x) => x && x.name !== undefined);
  } else if (isObj(src)) {
    items = Object.entries(src).map(([k, v]) => ({
      name: k,
      value: toNum(isObj(v) ? pick(v, ["importance", "shap_value", "value", "mean_abs_shap"]) : v),
    }));
  }

  return items
    .filter((x) => x.value !== null)
    .map((x) => ({ name: String(x.name), value: x.value }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}
