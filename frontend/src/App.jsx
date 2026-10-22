
import { useMemo, useState } from "react";
import "./App.css";

// Layout and shared components
import DoctorDashboard from "./pages/DoctorDashboard";
import useAppData from "./hooks/useAppData";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { ErrorBanner } from "./components/common";

// Patient pages
import Dashboard from "./pages/Dashboard";
import Patient from "./pages/Patient";
import DigitalTwin from "./pages/DigitalTwin";
import Monitoring from "./pages/Monitoring";
import Prediction from "./pages/Prediction";
import ExplainableAI from "./pages/ExplainableAI";
import MedicalImages from "./pages/MedicalImages";
import DiabetesPrediction from "./pages/DiabetesPrediction";
import CKDPrediction from "./components/CKDPrediction";
import DiseasePredictionCenter from "./components/DiseasePredictionCenter";
import PredictionHistory from "./pages/PredictionHistory";
import Login from "./pages/Login";

// Data normalization utilities
import {
  normalizeFeatures,
  normalizeMonitoring,
  normalizePatient,
  normalizePrediction,
  normalizeTwin,
} from "./utils/data";

// ------------------------------------------------------------
// PAGE CONFIGURATION
// ------------------------------------------------------------

const PAGE_META = {
  diseaseCenter: {
    title: "Disease Prediction Center",
    subtitle: "Explore the heart disease, diabetes, and CKD model modules",
    Component: DiseasePredictionCenter,
  },

  predictionHistory: {
    title: "Prediction History",
    subtitle: "Review and compare your saved prediction results",
    Component: PredictionHistory,
  },

  dashboard: {
    title: "Dashboard",
    subtitle:
      "AI-Driven Digital Twin for Personalized Healthcare Monitoring",
    Component: Dashboard,
  },

  patient: {
    title: "Patient",
    subtitle: "Patient profile and connection status",
    Component: Patient,
  },

  twin: {
    title: "Digital Twin",
    subtitle: "Patient-specific virtual healthcare model",
    Component: DigitalTwin,
  },

  monitoring: {
    title: "Monitoring",
    subtitle: "Real-time wearable health monitoring",
    Component: Monitoring,
  },

  prediction: {
    title: "AI Prediction",
    subtitle: "Random Forest heart disease risk model",
    Component: Prediction,
  },

  xai: {
    title: "Explainable AI",
    subtitle: "Understanding model feature contributions",
    Component: ExplainableAI,
  },

  medicalImages: {
    title: "Medical Images",
    subtitle: "Upload and review patient medical images",
    Component: MedicalImages,
  },

  diabetes: {
    title: "Diabetes Prediction",
    subtitle: "Experimental machine-learning risk estimate",
    Component: DiabetesPrediction,
  },

  ckd: {
    title: "CKD Prediction",
    subtitle: "Experimental chronic kidney disease risk estimate",
    Component: CKDPrediction,
  },
};

// ------------------------------------------------------------
// AUTHENTICATION HELPERS
// ------------------------------------------------------------

function getSavedSession() {
  try {
    const token = localStorage.getItem("healthTwinToken");
    const storedUser = localStorage.getItem("healthTwinUser");

    if (!token || !storedUser) {
      return { authenticated: false, user: null };
    }

    const user = JSON.parse(storedUser);

    if (!user || !user.role) {
      return { authenticated: false, user: null };
    }

    return {
      authenticated: true,
      user,
    };
  } catch {
    return {
      authenticated: false,
      user: null,
    };
  }
}

// ------------------------------------------------------------
// MAIN APP
// ------------------------------------------------------------

export default function App() {
  // Restore the saved login session.
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [page, setPage] = useState("dashboard");
  const [navOpen, setNavOpen] = useState(false);

  // Hooks must run consistently on every render.
  // Patient-specific data is loaded only for patient accounts.
  const patientId =
    user?.role === "patient" ? user?.patient_id : null;

  const raw = useAppData(patientId);

  // ----------------------------------------------------------
  // NORMALIZED APPLICATION DATA
  // ----------------------------------------------------------

  const view = useMemo(
    () => ({
      raw,

      patient: normalizePatient(raw.patient, raw.twin),

      twin: raw.twin,

      twinView: normalizeTwin(raw.twin),

      monitoring: normalizeMonitoring(raw.monitoring),

      prediction: normalizePrediction(raw.twin),

      features: normalizeFeatures(raw.explanations),

      errors: raw.errors,

      online: raw.online,

      lastUpdated: raw.lastUpdated,
    }),
    [raw]
  );

  // ----------------------------------------------------------
  // LOGIN
  // ----------------------------------------------------------

  const handleLogin = (loggedInUser) => {
    const token = localStorage.getItem("healthTwinToken");

    if (!token || !loggedInUser) {
      console.error(
        "Login failed: token or user information is missing."
      );
      return;
    }

    setUser(loggedInUser);
    setAuthenticated(true);
    setPage("dashboard");
    setNavOpen(false);
  };

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("healthTwinToken");
    localStorage.removeItem("healthTwinUser");

    setUser(null);
    setAuthenticated(false);
    setPage("dashboard");
    setNavOpen(false);
  };

  // ----------------------------------------------------------
  // NAVIGATION
  // ----------------------------------------------------------

  const navigate = (id) => {
    if (!PAGE_META[id]) {
      console.warn(`Unknown page requested: ${id}`);
      return;
    }

    setPage(id);
    setNavOpen(false);

    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // ----------------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------------

  if (!authenticated || !user) {
    return <Login onLogin={handleLogin} />;
  }

  // ----------------------------------------------------------
  // DOCTOR INTERFACE
  // ----------------------------------------------------------

  // Doctors use the dedicated doctor dashboard.
  if (user.role === "doctor") {
    return (
      <DoctorDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Only patient accounts should access the patient interface.
  if (user.role !== "patient") {
    handleLogout();
    return <Login onLogin={handleLogin} />;
  }

  // ----------------------------------------------------------
  // PATIENT INTERFACE
  // ----------------------------------------------------------

  const {
    title,
    subtitle,
    Component,
  } = PAGE_META[page] || PAGE_META.dashboard;

  return (
    <div className="app-shell">
      {/* Accessibility */}
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar
        active={page}
        onNavigate={navigate}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        online={view.online}
      />

      <div className="main-col">
        {/* Header */}
        <Header
          title={title}
          subtitle={subtitle}
          patientName={view.patient?.name || "Patient"}
          online={view.online}
          onMenu={() => setNavOpen(true)}
        />

        {/* Logout */}
        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
          title={`Logout ${user?.username || ""}`}
        >
          Logout
        </button>

        {/* Main content */}
        <main
          id="main"
          className="content"
          key={page}
        >
          <ErrorBanner errors={view.errors} />

          {/* Medical image page manages its own loading state.
              It must remain accessible even while other patient
              dashboard data is loading. */}
          {page === "medicalImages" ? (
            <MedicalImages />
          ) : page === "diseaseCenter" ? (
            <DiseasePredictionCenter onNavigate={navigate} />
          ) : page === "diabetes" ? (
            <DiabetesPrediction />
          ) : page === "ckd" ? (
            <CKDPrediction />
          ) : page === "predictionHistory" ? (
            <PredictionHistory />
          ) : raw.loading ? (
            <div className="loading" role="status">
              <span
                className="spinner"
                aria-hidden="true"
              />
              Loading patient data...
            </div>
          ) : (
            <Component
              data={view}
              onNavigate={navigate}
            />
          )}
        </main>
      </div>
    </div>
  );
}
