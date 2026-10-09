import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import {
  API_URL,
  POLL_INTERVAL_MS,
  getAuthToken,
} from "../api";


const errText = (e) =>
  e?.response?.data?.detail ||
  e?.message ||
  "Request failed";


// ============================================================
// APP DATA HOOK
// ============================================================

export default function useAppData(patientId) {

  const [patient, setPatient] = useState(null);
  const [twin, setTwin] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [explanations, setExplanations] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  const mounted = useRef(true);


  // ============================================================
  // ERROR HANDLER
  // ============================================================

  const setErr = useCallback((key, value) => {

    setErrors((prev) => {

      if (prev[key] === value) {
        return prev;
      }

      return {
        ...prev,
        [key]: value,
      };
    });

  }, []);


  // ============================================================
  // AUTH CONFIG
  // ============================================================

  const authConfig = useCallback(() => {

    const token = getAuthToken();

    if (!token) {
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

  }, []);


  // ============================================================
  // LOAD MONITORING
  // ============================================================

  const loadMonitoring = useCallback(async () => {

    if (!patientId) {
      return;
    }

    try {

      const response = await axios.get(
        `${API_URL}/monitoring/${patientId}`,
        authConfig()
      );

      if (!mounted.current) {
        return;
      }

      setMonitoring(response.data);

      setLastUpdated(new Date());

      setErr(
        "monitoring",
        null
      );

    } catch (error) {

      if (mounted.current) {

        setErr(
          "monitoring",
          errText(error)
        );
      }
    }

  }, [
    patientId,
    authConfig,
    setErr,
  ]);


  // ============================================================
  // LOAD DIGITAL TWIN
  // ============================================================

  const loadTwin = useCallback(async () => {

    if (!patientId) {
      return;
    }

    try {

      const response = await axios.get(
        `${API_URL}/digital-twin/${patientId}`,
        authConfig()
      );

      if (!mounted.current) {
        return;
      }

      setTwin(response.data);

      setErr(
        "twin",
        null
      );

    } catch (error) {

      if (mounted.current) {

        setErr(
          "twin",
          errText(error)
        );
      }
    }

  }, [
    patientId,
    authConfig,
    setErr,
  ]);


  // ============================================================
  // MAIN DATA LOADING
  // ============================================================

  useEffect(() => {

    mounted.current = true;


    // ----------------------------------------------------------
    // No patient ID
    // ----------------------------------------------------------

    if (!patientId) {

      setLoading(false);

      return () => {
        mounted.current = false;
      };
    }


    // ----------------------------------------------------------
    // Reset data when patient changes
    // ----------------------------------------------------------

    setPatient(null);
    setTwin(null);
    setMonitoring(null);
    setExplanations(null);

    setErrors({});

    setLastUpdated(null);

    setLoading(true);


    // ==========================================================
    // LOAD PATIENT
    // ==========================================================

    const loadPatient = async () => {

      try {

        const response = await axios.get(
          `${API_URL}/patients/${patientId}`,
          authConfig()
        );

        if (!mounted.current) {
          return;
        }

        setPatient(response.data);

        setErr(
          "patient",
          null
        );

      } catch (error) {

        if (mounted.current) {

          setErr(
            "patient",
            errText(error)
          );
        }
      }
    };


    // ==========================================================
    // LOAD SHAP EXPLANATIONS
    // ==========================================================

    const loadExplanations = async () => {

      try {

        const response = await axios.get(
          `${API_URL}/explanations/heart-disease`,
          authConfig()
        );

        if (!mounted.current) {
          return;
        }

        setExplanations(response.data);

        setErr(
          "explanations",
          null
        );

      } catch (error) {

        if (mounted.current) {

          setErr(
            "explanations",
            errText(error)
          );
        }
      }
    };


    // ==========================================================
    // INITIAL DATA LOAD
    // ==========================================================

    (async () => {

      await Promise.allSettled([
        loadPatient(),
        loadTwin(),
        loadExplanations(),
        loadMonitoring(),
      ]);

      if (mounted.current) {
        setLoading(false);
      }

    })();


    // ==========================================================
    // MONITORING POLLING
    // ==========================================================

    const monitoringTimer = setInterval(
      loadMonitoring,
      POLL_INTERVAL_MS
    );


    // ==========================================================
    // DIGITAL TWIN REFRESH
    // ==========================================================

    const twinTimer = setInterval(
      loadTwin,
      30000
    );


    // ==========================================================
    // CLEANUP
    // ==========================================================

    return () => {

      mounted.current = false;

      clearInterval(
        monitoringTimer
      );

      clearInterval(
        twinTimer
      );
    };

  }, [
    patientId,
    authConfig,
    loadMonitoring,
    loadTwin,
    setErr,
  ]);


  // ============================================================
  // RETURN DATA
  // ============================================================

  return {

    patient,

    twin,

    monitoring,

    explanations,

    loading,

    errors,

    lastUpdated,

    online:
      !errors.monitoring &&
      monitoring !== null,
  };
}