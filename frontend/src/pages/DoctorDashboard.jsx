import { useEffect, useState } from "react";
import axios from "axios";

import {
  LayoutDashboard,
  Users,
  HeartPulse,
  Activity,
  Brain,
  ShieldAlert,
  Database,
  LogOut,
  RefreshCw,
  UserRound,
  CircleCheck,
  Menu,
  X,
} from "lucide-react";

import { API_URL, getAuthToken } from "../api";

export default function DoctorDashboard({ user, onLogout }) {
  // ============================================================
  // STATE
  // ============================================================

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [monitoring, setMonitoring] = useState(null);
  const [twin, setTwin] = useState(null);

  const [loading, setLoading] = useState(true);
  const [patientLoading, setPatientLoading] = useState(false);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Current sidebar section
  const [activeSection, setActiveSection] = useState("dashboard");

  // ============================================================
  // AUTH
  // ============================================================

  const token = getAuthToken();

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const navigateToSection = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);

    if (section === "dashboard") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const element = document.getElementById(`doctor-${section}`);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // ============================================================
  // LOAD PATIENTS
  // ============================================================

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/patients/`,
        authConfig
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.patients || [];

      setPatients(data);

      // Automatically select the main demo patient
      if (data.length > 0) {
        const defaultPatient =
          data.find(
            (patient) =>
              patient.patient_id === "P-FULL-001"
          ) || data[0];

        await selectPatient(defaultPatient);
      }
    } catch (err) {
      console.error("DOCTOR PATIENT ERROR:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load patients."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SELECT PATIENT
  // ============================================================

  const selectPatient = async (patient) => {
    try {
      setPatientLoading(true);
      setSelectedPatient(patient);
      setError("");

      const [
        twinResponse,
        monitoringResponse,
      ] = await Promise.all([
        axios.get(
          `${API_URL}/digital-twin/${patient.patient_id}`,
          authConfig
        ),

        axios.get(
          `${API_URL}/monitoring/${patient.patient_id}`,
          authConfig
        ),
      ]);

      setTwin(twinResponse.data);
      setMonitoring(monitoringResponse.data);
    } catch (err) {
      console.error("PATIENT DATA ERROR:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load patient information."
      );

      setTwin(null);
      setMonitoring(null);
    } finally {
      setPatientLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadPatients();
  }, []);

  // ============================================================
  // DATA
  // ============================================================

  const latest =
    monitoring?.latest_reading || {};

  const predictions =
    twin?.predictions || [];

  const latestPrediction =
    predictions.length > 0
      ? predictions[predictions.length - 1]
      : null;

  const riskProbability =
    latestPrediction?.probability != null
      ? Number(latestPrediction.probability) * 100
      : null;

  const riskLevel =
    latestPrediction?.risk_level || "Unknown";

  const alertCount =
    monitoring?.alerts?.length || 0;

  const monitoringStatus =
    monitoring?.monitoring_status || "normal";

  // ============================================================
  // RISK CLASS
  // ============================================================

  const getRiskClass = () => {
    if (riskLevel === "High") {
      return "badge-danger";
    }

    if (riskLevel === "Moderate") {
      return "badge-warning";
    }

    if (riskLevel === "Low") {
      return "badge-success";
    }

    return "badge-neutral";
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="app-shell doctor-page">

      {/* ======================================================
          MOBILE SIDEBAR BACKDROP
          ====================================================== */}

      <div
        className={
          sidebarOpen
            ? "sidebar-backdrop show"
            : "sidebar-backdrop"
        }
        onClick={() => setSidebarOpen(false)}
      />

      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <aside
        className={
          sidebarOpen
            ? "sidebar open"
            : "sidebar"
        }
      >

        {/* BRAND */}

        <div className="brand">

          <div className="brand-mark">
            <HeartPulse size={21} />
          </div>

          <div>
            <div className="brand-name">
              HealthTwin AI
            </div>

            <div className="brand-sub">
              Doctor Portal
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close icon-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

        </div>

        {/* ====================================================
            NAVIGATION
            ==================================================== */}

        <nav className="nav">
          <ul>

            {/* Dashboard */}

            <li>
              <button
                type="button"
                className={
                  activeSection === "dashboard"
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() =>
                  navigateToSection("dashboard")
                }
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
            </li>

            {/* Patients */}

            <li>
              <button
                type="button"
                className={
                  activeSection === "patients"
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() =>
                  navigateToSection("patients")
                }
              >
                <Users size={18} />
                <span>Patients</span>
              </button>
            </li>

            {/* Digital Twins */}

            <li>
              <button
                type="button"
                className={
                  activeSection === "twin"
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() =>
                  navigateToSection("twin")
                }
              >
                <Database size={18} />
                <span>Digital Twins</span>
              </button>
            </li>

            {/* Monitoring */}

            <li>
              <button
                type="button"
                className={
                  activeSection === "monitoring"
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() =>
                  navigateToSection("monitoring")
                }
              >
                <Activity size={18} />
                <span>Monitoring</span>
              </button>
            </li>

            {/* AI Insights */}

            <li>
              <button
                type="button"
                className={
                  activeSection === "ai"
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() =>
                  navigateToSection("ai")
                }
              >
                <Brain size={18} />
                <span>AI Insights</span>
              </button>
            </li>

          </ul>
        </nav>

        {/* ====================================================
            SIDEBAR FOOTER
            ==================================================== */}

        <div className="sidebar-foot">

          <div className="system-status">

            <span className="status-dot ok" />

            <div>
              <div className="system-title">
                System Online
              </div>

              <div className="system-sub">
                FastAPI connected
              </div>
            </div>

          </div>

          <div className="version">
            Doctor Portal v1.0
          </div>

          <button
            type="button"
            className="doctor-sidebar-logout"
            onClick={onLogout}
          >
            <LogOut size={15} />
            Logout
          </button>

        </div>

      </aside>

      {/* ======================================================
          MAIN COLUMN
          ====================================================== */}

      <div className="main-col">

        {/* ====================================================
            TOP BAR
            ==================================================== */}

        <header className="topbar">

          <div className="topbar-left">

            <button
              type="button"
              className="menu-btn icon-btn"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div>

              <h1 className="page-title">
                Doctor Dashboard
              </h1>

              <div className="page-subtitle">
                Patient monitoring and AI-powered
                healthcare insights
              </div>

            </div>

          </div>

          <div className="topbar-right">

            <div className="doctor-top-user">

              <div className="avatar">
                <UserRound size={16} />
              </div>

              <div className="doctor-top-user-info">

                <strong>
                  Dr. {user?.username || "Doctor"}
                </strong>

                <span>
                  Healthcare Professional
                </span>

              </div>

            </div>

            <button
              type="button"
              className="icon-btn doctor-top-logout"
              onClick={onLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>

          </div>

        </header>

        {/* ====================================================
            CONTENT
            ==================================================== */}

        <main className="content">

          <div className="page">

            {/* ==================================================
                WELCOME
                ================================================== */}

            <div className="doctor-welcome-bar">

              <div>

                <h2>
                  Welcome, Dr.{" "}
                  {user?.username || "Doctor"}
                </h2>

                <p>
                  Monitor patients, Digital Twins,
                  real-time wearable data and AI
                  predictions from one place.
                </p>

              </div>

              <button
                type="button"
                className="doctor-refresh-btn"
                onClick={loadPatients}
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "doctor-spin"
                      : ""
                  }
                />

                Refresh Data
              </button>

            </div>

            {/* ==================================================
                ERROR
                ================================================== */}

            {error && (
              <div className="error-banner">

                <ShieldAlert size={17} />

                <span>
                  {error}
                </span>

              </div>
            )}

            {/* ==================================================
                METRIC CARDS
                ================================================== */}

            <div className="grid grid-4">

              {/* Patients */}

              <div className="metric-card">

                <div className="metric-top">

                  <div className="metric-icon">
                    <Users size={19} />
                  </div>

                  <span className="badge badge-info">
                    Active
                  </span>

                </div>

                <div className="metric-label">
                  Total Patients
                </div>

                <div className="metric-value">

                  <span className="metric-number">
                    {patients.length}
                  </span>

                  <span className="metric-unit">
                    registered
                  </span>

                </div>

              </div>

              {/* Monitoring */}

              <div className="metric-card tone-success">

                <div className="metric-top">

                  <div className="metric-icon">
                    <Activity size={19} />
                  </div>

                  <span className="badge badge-success">
                    <span className="badge-dot pulse" />
                    Live
                  </span>

                </div>

                <div className="metric-label">
                  Monitoring
                </div>

                <div className="metric-value">

                  <span className="metric-number">
                    Live
                  </span>

                </div>

              </div>

              {/* AI */}

              <div className="metric-card">

                <div className="metric-top">

                  <div className="metric-icon">
                    <Brain size={19} />
                  </div>

                  <span className="badge badge-info">
                    AI
                  </span>

                </div>

                <div className="metric-label">
                  Prediction Model
                </div>

                <div className="metric-value">

                  <span
                    className="metric-number"
                    style={{
                      fontSize: "24px",
                    }}
                  >
                    Random Forest
                  </span>

                </div>

              </div>

              {/* Alerts */}

              <div className="metric-card tone-warning">

                <div className="metric-top">

                  <div className="metric-icon">
                    <ShieldAlert size={19} />
                  </div>

                  <span
                    className={
                      alertCount > 0
                        ? "badge badge-warning"
                        : "badge badge-success"
                    }
                  >
                    {alertCount > 0
                      ? "Attention"
                      : "Normal"}
                  </span>

                </div>

                <div className="metric-label">
                  Active Alerts
                </div>

                <div className="metric-value">

                  <span className="metric-number">
                    {alertCount}
                  </span>

                </div>

              </div>

            </div>

            {/* ==================================================
                PATIENTS + OVERVIEW
                ================================================== */}

            <div
              id="doctor-patients"
              className="grid grid-2-wide doctor-scroll-section"
            >

              {/* PATIENT LIST */}

              <section className="card">

                <div className="section-header">

                  <div className="section-title-wrap">

                    <div className="section-icon">
                      <Users size={17} />
                    </div>

                    <div>

                      <h2 className="section-title">
                        Patients
                      </h2>

                      <p className="section-subtitle">
                        Select a patient to inspect
                        their Digital Twin
                      </p>

                    </div>

                  </div>

                  <span className="badge badge-neutral">
                    {patients.length} patients
                  </span>

                </div>

                {loading ? (

                  <div className="loading">

                    <div className="spinner" />

                    Loading patients...

                  </div>

                ) : patients.length === 0 ? (

                  <div className="empty-state">
                    No patients found.
                  </div>

                ) : (

                  <div className="doctor-patient-table">

                    {patients.map((patient) => {

                      const isSelected =
                        selectedPatient?.patient_id ===
                        patient.patient_id;

                      return (

                        <button
                          type="button"
                          key={patient.patient_id}
                          className={
                            isSelected
                              ? "doctor-patient-row selected"
                              : "doctor-patient-row"
                          }
                          onClick={() =>
                            selectPatient(patient)
                          }
                        >

                          <div className="avatar">
                            {patient.name
                              ?.charAt(0)
                              ?.toUpperCase() || "P"}
                          </div>

                          <div className="doctor-patient-main">

                            <strong>
                              {patient.name}
                            </strong>

                            <span>
                              {patient.patient_id}
                            </span>

                          </div>

                          <span className="badge badge-success">
                            Stable
                          </span>

                        </button>

                      );
                    })}

                  </div>

                )}

              </section>

              {/* PATIENT OVERVIEW */}

              <section className="card">

                <div className="section-header">

                  <div className="section-title-wrap">

                    <div className="section-icon">
                      <UserRound size={17} />
                    </div>

                    <div>

                      <h2 className="section-title">
                        Patient Overview
                      </h2>

                      <p className="section-subtitle">
                        Current patient health status
                      </p>

                    </div>

                  </div>

                  {selectedPatient && (
                    <span className="badge badge-success">
                      <span className="badge-dot pulse" />
                      Live
                    </span>
                  )}

                </div>

                {selectedPatient ? (

                  patientLoading ? (

                    <div className="loading">

                      <div className="spinner" />

                      Loading patient data...

                    </div>

                  ) : (

                    <>

                      <div className="doctor-patient-heading">

                        <div className="avatar avatar-lg">
                          {selectedPatient.name
                            ?.charAt(0)
                            ?.toUpperCase() || "P"}
                        </div>

                        <div>

                          <h3>
                            {selectedPatient.name}
                          </h3>

                          <span>
                            {selectedPatient.patient_id}
                          </span>

                        </div>

                      </div>

                      <dl className="stat-list two">

                        <div>

                          <dt>
                            Age
                          </dt>

                          <dd>
                            {selectedPatient.age ?? "—"}
                          </dd>

                        </div>

                        <div>

                          <dt>
                            Sex
                          </dt>

                          <dd>
                            {selectedPatient.sex === 1
                              ? "Male"
                              : selectedPatient.sex === 0
                              ? "Female"
                              : "—"}
                          </dd>

                        </div>

                        <div>

                          <dt>
                            Heart Rate
                          </dt>

                          <dd>
                            {latest.heart_rate ?? "—"} BPM
                          </dd>

                        </div>

                        <div>

                          <dt>
                            SpO₂
                          </dt>

                          <dd>
                            {latest.spo2 ?? "—"}%
                          </dd>

                        </div>

                      </dl>

                      <div className="doctor-status-panel">

                        <div className="doctor-status-icon">
                          <CircleCheck size={20} />
                        </div>

                        <div>

                          <div className="status-panel-title">
                            Monitoring Status
                          </div>

                          <div className="small">
                            {monitoringStatus}
                          </div>

                        </div>

                      </div>

                    </>

                  )

                ) : (

                  <div className="empty-state">
                    Select a patient to view their health
                    information.
                  </div>

                )}

              </section>

            </div>

            {/* ==================================================
                AI INSIGHTS
                ================================================== */}

            <section
              id="doctor-ai"
              className="card doctor-scroll-section"
            >

              <div className="section-header">

                <div className="section-title-wrap">

                  <div className="section-icon">
                    <Brain size={17} />
                  </div>

                  <div>

                    <h2 className="section-title">
                      AI Health Insights
                    </h2>

                    <p className="section-subtitle">
                      Random Forest heart disease
                      prediction
                    </p>

                  </div>

                </div>

                <span className="badge badge-info">
                  Explainable AI
                </span>

              </div>

              {selectedPatient ? (

                <div className="doctor-ai-layout">

                  <div className="doctor-risk-card">

                    <div className="doctor-risk-label">
                      AI Heart Disease Risk
                    </div>

                    <div className="doctor-risk-number">

                      {riskProbability !== null
                        ? `${riskProbability.toFixed(1)}%`
                        : "—"}

                    </div>

                    <span
                      className={`badge ${getRiskClass()}`}
                    >
                      {riskLevel}
                    </span>

                    <div className="doctor-risk-model">
                      Random Forest prediction
                    </div>

                  </div>

                  <div className="doctor-ai-details">

                    <div className="doctor-ai-detail">

                      <span>
                        Prediction
                      </span>

                      <strong>
                        {latestPrediction?.prediction === 1
                          ? "Positive"
                          : latestPrediction?.prediction === 0
                          ? "Negative"
                          : "Not Available"}
                      </strong>

                    </div>

                    <div className="doctor-ai-detail">

                      <span>
                        Model
                      </span>

                      <strong>
                        Random Forest
                      </strong>

                    </div>

                    <div className="doctor-ai-detail">

                      <span>
                        Patient
                      </span>

                      <strong>
                        {selectedPatient.patient_id}
                      </strong>

                    </div>

                    <div className="doctor-ai-detail">

                      <span>
                        Risk Level
                      </span>

                      <strong>
                        {riskLevel}
                      </strong>

                    </div>

                  </div>

                </div>

              ) : (

                <div className="empty-state">
                  Select a patient to view AI insights.
                </div>

              )}

            </section>

            {/* ==================================================
                MONITORING
                ================================================== */}

            <section
              id="doctor-monitoring"
              className="card doctor-scroll-section"
            >

              <div className="section-header">

                <div className="section-title-wrap">

                  <div className="section-icon">
                    <Activity size={17} />
                  </div>

                  <div>

                    <h2 className="section-title">
                      Real-Time Monitoring
                    </h2>

                    <p className="section-subtitle">
                      Latest wearable health readings
                    </p>

                  </div>

                </div>

                <span className="badge badge-success">
                  <span className="badge-dot pulse" />
                  Live
                </span>

              </div>

              {selectedPatient ? (

                <div className="live-strip">

                  {/* Heart Rate */}

                  <div className="live-item">

                    <HeartPulse size={21} />

                    <div>

                      <div className="small muted">
                        Heart Rate
                      </div>

                      <div className="live-value">

                        {latest.heart_rate ?? "—"}

                        <span className="small muted">
                          {" "}BPM
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* SpO2 */}

                  <div className="live-item">

                    <Activity size={21} />

                    <div>

                      <div className="small muted">
                        SpO₂
                      </div>

                      <div className="live-value">

                        {latest.spo2 ?? "—"}

                        <span className="small muted">
                          {" "}%
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* Steps */}

                  <div className="live-item">

                    <Activity size={21} />

                    <div>

                      <div className="small muted">
                        Steps
                      </div>

                      <div className="live-value">
                        {latest.steps ?? "—"}
                      </div>

                    </div>

                  </div>

                  {/* Sleep */}

                  <div className="live-item">

                    <HeartPulse size={21} />

                    <div>

                      <div className="small muted">
                        Sleep
                      </div>

                      <div className="live-value">

                        {latest.sleep_hours ?? "—"}

                        <span className="small muted">
                          {" "}hrs
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              ) : (

                <div className="empty-state">
                  Select a patient to view monitoring data.
                </div>

              )}

            </section>

            {/* ==================================================
                DIGITAL TWIN
                ================================================== */}

            <section
              id="doctor-twin"
              className="card doctor-scroll-section"
            >

              <div className="section-header">

                <div className="section-title-wrap">

                  <div className="section-icon">
                    <Database size={17} />
                  </div>

                  <div>

                    <h2 className="section-title">
                      Digital Twin Status
                    </h2>

                    <p className="section-subtitle">
                      Patient-specific virtual health
                      representation
                    </p>

                  </div>

                </div>

                <span className="badge badge-success">
                  Active
                </span>

              </div>

              {selectedPatient ? (

                <div className="doctor-twin-grid">

                  <div className="doctor-twin-item">

                    <span>
                      Patient
                    </span>

                    <strong>
                      {selectedPatient.patient_id}
                    </strong>

                  </div>

                  <div className="doctor-twin-item">

                    <span>
                      Clinical Data
                    </span>

                    <strong>
                      {twin?.clinical_data
                        ? Object.keys(
                            twin.clinical_data
                          ).length
                        : 0}{" "}
                      fields
                    </strong>

                  </div>

                  <div className="doctor-twin-item">

                    <span>
                      Wearable Records
                    </span>

                    <strong>
                      {twin?.wearable_data?.length || 0}
                    </strong>

                  </div>

                  <div className="doctor-twin-item">

                    <span>
                      Predictions
                    </span>

                    <strong>
                      {predictions.length}
                    </strong>

                  </div>

                </div>

              ) : (

                <div className="empty-state">
                  Select a patient to view Digital Twin
                  information.
                </div>

              )}

            </section>

            {/* ==================================================
                FOOTER
                ================================================== */}

            <div className="disclaimer">

              <ShieldAlert size={15} />

              <span>
                Research prototype — AI predictions are
                for demonstration and are not intended
                for clinical diagnosis.
              </span>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}