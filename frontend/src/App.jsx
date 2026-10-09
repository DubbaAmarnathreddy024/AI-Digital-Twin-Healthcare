import { useMemo, useState } from "react";
import "./App.css";

import DoctorDashboard from "./pages/DoctorDashboard";
import useAppData from "./hooks/useAppData";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { ErrorBanner } from "./components/common";

import Dashboard from "./pages/Dashboard";
import Patient from "./pages/Patient";
import DigitalTwin from "./pages/DigitalTwin";
import Monitoring from "./pages/Monitoring";
import Prediction from "./pages/Prediction";
import ExplainableAI from "./pages/ExplainableAI";
import Login from "./pages/Login";

import {
  normalizeFeatures,
  normalizeMonitoring,
  normalizePatient,
  normalizePrediction,
  normalizeTwin,
} from "./utils/data";


const PAGE_META = {
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
};


export default function App() {

  // ============================================================
  // AUTHENTICATION STATE
  // ============================================================

  // We intentionally start unauthenticated so the login page
  // appears whenever the React application starts.
  const [authenticated, setAuthenticated] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("healthTwinUser");

      return stored
        ? JSON.parse(stored)
        : null;

    } catch {
      return null;
    }
  });


  // ============================================================
  // PATIENT APPLICATION STATE
  // ============================================================

  // IMPORTANT:
  // Hooks must run on every render.
  //
  // For doctors, patient_id is null, so useAppData simply
  // waits and does not load patient-specific information.
  const raw = useAppData(
    user?.role === "patient"
      ? user?.patient_id
      : null
  );


  const [page, setPage] = useState("dashboard");
  const [navOpen, setNavOpen] = useState(false);


  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = (loggedInUser) => {

    console.log(
      "LOGIN SUCCESS:",
      loggedInUser
    );

    setUser(loggedInUser);
    setAuthenticated(true);
    setPage("dashboard");
    setNavOpen(false);
  };


  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {

    localStorage.removeItem("healthTwinToken");
    localStorage.removeItem("healthTwinUser");

    setUser(null);
    setAuthenticated(false);
    setPage("dashboard");
    setNavOpen(false);
  };


  // ============================================================
  // NORMALIZE PATIENT APPLICATION DATA
  // ============================================================

  const view = useMemo(
    () => ({
      raw,

      patient: normalizePatient(
        raw.patient,
        raw.twin
      ),

      twin: raw.twin,

      twinView: normalizeTwin(
        raw.twin
      ),

      monitoring: normalizeMonitoring(
        raw.monitoring
      ),

      prediction: normalizePrediction(
        raw.twin
      ),

      features: normalizeFeatures(
        raw.explanations
      ),

      errors: raw.errors,

      online: raw.online,

      lastUpdated: raw.lastUpdated,
    }),

    [raw]
  );


  // ============================================================
  // NAVIGATION
  // ============================================================

  const navigate = (id) => {

    setPage(id);
    setNavOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // ============================================================
  // LOGIN SCREEN
  // ============================================================

  if (!authenticated) {

    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


  // ============================================================
  // DOCTOR INTERFACE
  // ============================================================

  // Doctors do NOT use the patient sidebar/dashboard.
  //
  // doctor001
  //     ↓
  // DoctorDashboard
  //
  // Patient users continue to the existing application below.

  if (user?.role === "doctor") {

    return (
      <DoctorDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }


  // ============================================================
  // PATIENT INTERFACE
  // ============================================================

  const {
    title,
    subtitle,
    Component,
  } = PAGE_META[page];


  return (
    <div className="app-shell">

      {/* Accessibility */}
      <a
        className="skip-link"
        href="#main"
      >
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
          patientName={view.patient.name}
          online={view.online}
          onMenu={() => setNavOpen(true)}
        />


        {/* Logout */}
        <button
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

          <ErrorBanner
            errors={view.errors}
          />


          {raw.loading ? (

            <div
              className="loading"
              role="status"
            >

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