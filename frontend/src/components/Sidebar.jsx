import { Activity, Brain, HeartPulse, LayoutDashboard, Lightbulb, Network, User, X } from "lucide-react";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "patient", label: "Patient", icon: User },
  { id: "twin", label: "Digital Twin", icon: Network },
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "prediction", label: "AI Prediction", icon: Brain },
  { id: "xai", label: "Explainable AI", icon: Lightbulb },
];

export default function Sidebar({ active, onNavigate, open, onClose, online }) {
  return (
    <>
      <div className={`sidebar-backdrop${open ? " show" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar${open ? " open" : ""}`} aria-label="Primary">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <HeartPulse size={22} />
          </span>
          <div>
            <p className="brand-name">HealthTwin</p>
            <p className="brand-sub">AI Healthcare</p>
          </div>
          <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="nav">
          <ul>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  className={`nav-item${active === id ? " active" : ""}`}
                  onClick={() => onNavigate(id)}
                  aria-current={active === id ? "page" : undefined}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-foot">
          <div className="system-status">
            <span className={`status-dot ${online ? "ok" : "bad"}`} aria-hidden="true" />
            <div>
              <p className="system-title">{online ? "System Online" : "System Offline"}</p>
              <p className="system-sub">{online ? "All services connected" : "Cannot reach backend"}</p>
            </div>
          </div>
          <p className="version">AI Digital Twin v1.0</p>
        </div>
      </aside>
    </>
  );
}
