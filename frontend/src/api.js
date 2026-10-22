// ============================================================
// BACKEND CONNECTION
// ============================================================

export const API_URL = "http://127.0.0.1:8000";


// ============================================================
// MONITORING
// ============================================================

export const POLL_INTERVAL_MS = 5000;


// ============================================================
// MODEL METRICS
// ============================================================

export const MODEL_METRICS = {
  model: "Random Forest",
  rocAuc: "95.67%",
  f1: "91.53%",
};


// ============================================================
// AUTHENTICATION
// ============================================================

// Get JWT token of the currently logged-in user
export const getAuthToken = () => {
  return localStorage.getItem("healthTwinToken");
};


// Get logged-in user information
export const getAuthUser = () => {
  try {
    const stored = localStorage.getItem("healthTwinUser");

    return stored
      ? JSON.parse(stored)
      : null;

  } catch {
    return null;
  }
};


// Get patient ID of the currently logged-in patient
export const getPatientId = () => {
  const user = getAuthUser();

  return user?.patient_id || null;
};

// ============================================================
// PREDICTION HISTORY API HELPERS
// ============================================================

export const getPredictionHistory = async ({ disease, limit = 50, offset = 0 } = {}) => {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (disease) params.set("disease", disease);
  const response = await fetch(`${API_URL}/predictions/history?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error(response.status === 401 ? "Please sign in again." : "Could not load prediction history.");
  return response.json();
};

export const getPredictionComparison = async () => {
  const response = await fetch(`${API_URL}/predictions/compare`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error(response.status === 401 ? "Please sign in again." : "Could not load prediction comparison.");
  return response.json();
};
