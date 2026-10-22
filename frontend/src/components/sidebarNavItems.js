
import {
  Activity,
  Brain,
  HeartPulse,
  LayoutDashboard,
  Lightbulb,
  Network,
  User,
  Images,
  Droplets,
  Stethoscope,
  History,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    id: "diseaseCenter",
    label: "Disease Prediction Center",
    icon: Stethoscope,
  },
  {
    id: "predictionHistory",
    label: "Prediction History",
    icon: History,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "patient",
    label: "Patient",
    icon: User,
  },
  {
    id: "twin",
    label: "Digital Twin",
    icon: Network,
  },
  {
    id: "monitoring",
    label: "Monitoring",
    icon: Activity,
  },
  {
    id: "prediction",
    label: "AI Prediction",
    icon: Brain,
  },
  {
    id: "xai",
    label: "Explainable AI",
    icon: Lightbulb,
  },
  {
    id: "medicalImages",
    label: "Medical Images",
    icon: Images,
  },
  {
    id: "diabetes",
    label: "Diabetes Prediction",
    icon: Droplets,
  },
  {
    id: "ckd",
    label: "CKD Prediction",
    icon: Activity,
  },
];
