import { Menu } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { initials } from "../utils/data";

export default function Header({ title, subtitle, patientName, online, onMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open navigation menu">
          <Menu size={22} />
        </button>
        <div className="topbar-titles">
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="topbar-right">
        <StatusBadge tone={online ? "success" : "danger"} dot pulse={online}>
          {online ? "Live Monitoring" : "Offline"}
        </StatusBadge>
        <div className="patient-chip" title={patientName || "Patient"}>
          <span className="avatar" aria-hidden="true">
            {initials(patientName)}
          </span>
          <span className="patient-chip-name">{patientName || "Patient"}</span>
        </div>
      </div>
    </header>
  );
}
