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