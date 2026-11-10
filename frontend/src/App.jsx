
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  Map,
  Sprout,
  ShieldCheck,
  FileText,
  Bell,
  Settings,
  CloudRain,
  AlertTriangle,
  Leaf,
  ArrowUpRight,
  Menu,
  X,
  Satellite,
  Activity,
  Mic,
  Users,
  ClipboardCheck,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
} from "react-leaflet";

import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./App.css";

// Page components
import FarmRegistration from "./FarmRegistration";
import DamageAssessment from "./DamageAssessment";
import ClaimsManagement from "./ClaimsManagement";
import Reports from "./Reports";
import SatelliteMonitoring from "./SatelliteMonitoring";
import CropIntelligence from "./CropIntelligence";
import DisasterMonitoring from "./DisasterMonitoring";
import VoiceAssistant from "./VoiceAssistant";
import AdminDashboard from "./AdminDashboard";

const API = "http://localhost:5000/api";

function App() {
  const [active, setActive] = useState("Overview");
  const [farm, setFarm] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [apiStatus, setApiStatus] = useState("Checking");
  const [showRegistration, setShowRegistration] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Load dashboard information from backend
  const loadDashboard = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/farms`);
      setFarm(response.data.farms?.[0] || null);
    } catch (error) {
      console.error("Farm loading error:", error);
      setFarm(null);
    }

    try {
      const response = await axios.get(`${API}/alerts`);
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error("Alert loading error:", error);
      setAlerts([]);
    }

    try {
      await axios.get(`${API}/health`);
      setApiStatus("Connected");
    } catch (error) {
      console.error("Backend connection error:", error);
      setApiStatus("Offline");
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Sidebar navigation
  const navItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Farm Monitoring", icon: Map },
    { name: "Crop Health", icon: Sprout },
    { name: "Crop Intelligence", icon: Activity },
    { name: "Satellite Monitoring", icon: Satellite },
    { name: "Disaster Monitoring", icon: CloudRain },
    { name: "Damage Assessment", icon: ClipboardCheck },
    { name: "Insurance Claims", icon: ShieldCheck },
    { name: "Reports", icon: FileText },
    { name: "Voice Assistant", icon: Mic },
    { name: "Admin Dashboard", icon: Users },
  ];

  const handleNavigation = (page) => {
    setActive(page);
    setMenuOpen(false);
  };

  // Farm registration screen
  if (showRegistration) {
    return (
      <div className="app-shell">
        <main className="main-content">
          <header className="topbar">
            <div>
              <div className="breadcrumb">
                Workspace / <strong>Register Farm</strong>
              </div>
              <h1>Farm Registration</h1>
            </div>

            <span
              className={`connection ${
                apiStatus === "Connected" ? "online" : ""
              }`}
            >
              <span className="status-dot" />
              API {apiStatus}
            </span>
          </header>

          <div className="page-content">
            <FarmRegistration
              onBack={() => setShowRegistration(false)}
              onSuccess={() => {
                setShowRegistration(false);
                setActive("Overview");
                loadDashboard();
              }}
            />
          </div>
        </main>
      </div>
    );
  }

  // Main application
  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className={`sidebar ${menuOpen ? "show" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Leaf size={23} />
          </div>

          <div>
            <h2>
              CropGuard<span>AI</span>
            </h2>
            <small>INTELLIGENT AGRICULTURE</small>
          </div>

          <button
            className="close-menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  active === item.name ? "active" : ""
                }`}
                onClick={() => handleNavigation(item.name)}
              >
                <Icon size={19} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon">
              <ShieldCheck size={21} />
            </div>

            <h4>Crop protection, simplified.</h4>

            <p>
              Monitor your farm and organise your insurance evidence.
            </p>
          </div>

          <button
            className="nav-item"
            onClick={() => handleNavigation("Admin Dashboard")}
          >
            <Settings size={19} />
            Settings
          </button>

          <div className="profile">
            <div className="avatar">DF</div>
            <div>
              <strong>Demo Farmer</strong>
              <small>Farmer account</small>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </button>

          <div>
            <div className="breadcrumb">
              Workspace / <strong>{active}</strong>
            </div>

            <h1>
              {active === "Overview" ? "Farm Overview" : active}
            </h1>
          </div>

          <div className="top-actions">
            <span
              className={`connection ${
                apiStatus === "Connected" ? "online" : ""
              }`}
            >
              <span className="status-dot" />
              API {apiStatus}
            </span>

            <button className="icon-button" title="Notifications">
              <Bell size={19} />
            </button>

            <div className="avatar">DF</div>
          </div>
        </header>

        <div className="page-content">
          {/* OVERVIEW */}
          {active === "Overview" && (
            <>
              <section className="welcome-row">
                <div>
                  <p className="eyebrow">CROPGUARD AI DASHBOARD</p>
                  <h2>Good morning, Farmer 👋</h2>
                  <p className="muted">
                    Here's what's happening with your farm today.
                  </p>
                </div>

                <div className="demo-label">
                  DEMO ENVIRONMENT · SAMPLE DATA
                </div>
              </section>

              <section className="farm-banner">
                <div className="farm-banner-icon">
                  <Sprout size={27} />
                </div>

                <div className="farm-info">
                  <span>YOUR REGISTERED FARM</span>

                  <h3>
                    {farm?._id
                      ? `CG-${farm._id.slice(-6).toUpperCase()}`
                      : "CG001"}
                    {" · "}
                    {farm?.location || "Coimbatore, Tamil Nadu"}
                  </h3>

                  <p>
                    {farm?.crop || "Banana"} plantation ·{" "}
                    {farm?.area || 2.5} acres
                  </p>
                </div>

                <button
                  className="outline-button"
                  onClick={() => handleNavigation("Farm Monitoring")}
                >
                  View farm <ArrowUpRight size={16} />
                </button>

                <button
                  className="outline-button"
                  onClick={() => setShowRegistration(true)}
                >
                  + Register farm
                </button>
              </section>

              <section className="stats-grid">
                <StatCard
                  icon={<Leaf />}
                  label="Crop health index"
                  value="82/100"
                  note="Sample vegetation score"
                  color="green"
                />

                <StatCard
                  icon={<Map />}
                  label="Monitored area"
                  value={`${farm?.area || 2.5} ac`}
                  note="Registered farm area"
                  color="blue"
                />

                <StatCard
                  icon={<AlertTriangle />}
                  label="Active alerts"
                  value={alerts.length}
                  note="Backend notifications"
                  color="orange"
                />

                <StatCard
                  icon={<ShieldCheck />}
                  label="Insurance status"
                  value="Registered"
                  note="Verification pending"
                  color="purple"
                />
              </section>

              <section className="content-grid">
                <div className="panel map-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Farm location</h3>
                      <p>Registered farm boundary</p>
                    </div>

                    <span className="live-tag">MAP VIEW</span>
                  </div>

                  <MapContainer
                    center={[11.0168, 76.9558]}
                    zoom={14}
                    scrollWheelZoom={false}
                    className="farm-map"
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {farm?.boundary?.length >= 3 ? (
                      <Polygon
                        positions={farm.boundary}
                        pathOptions={{
                          color: "#269b65",
                          fillColor: "#42c88b",
                          fillOpacity: 0.3,
                        }}
                      >
                        <Popup>Registered farm boundary</Popup>
                      </Polygon>
                    ) : (
                      <Polygon
                        positions={[
                          [11.021, 76.951],
                          [11.022, 76.958],
                          [11.017, 76.960],
                          [11.015, 76.953],
                        ]}
                        pathOptions={{
                          color: "#269b65",
                          fillColor: "#42c88b",
                          fillOpacity: 0.3,
                        }}
                      >
                        <Popup>Illustrative demo boundary</Popup>
                      </Polygon>
                    )}
                  </MapContainer>

                  <div className="map-legend">
                    <span />
                    Registered farm boundary
                    <small>Illustrative until verified</small>
                  </div>
                </div>

                <div className="panel health-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Crop health</h3>
                      <p>Sample assessment</p>
                    </div>

                    <Sprout color="#269b65" />
                  </div>

                  <div className="health-score">
                    <div className="score-ring">
                      <div>
                        <strong>82</strong>
                        <small>/100</small>
                      </div>
                    </div>

                    <h3>Good condition</h3>

                    <p>
                      Illustrative score, not a verified satellite
                      measurement.
                    </p>
                  </div>

                  <div className="health-footer">
                    <span>
                      <span className="legend-dot green-dot" />
                      Healthy
                    </span>
                    <span>Sample result</span>
                  </div>
                </div>
              </section>

              <section className="panel alerts-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Recent observations & alerts</h3>
                    <p>Latest backend monitoring updates</p>
                  </div>
                </div>

                {alerts.length === 0 ? (
                  <p className="muted">No observations available.</p>
                ) : (
                  alerts.map((alert, index) => (
                    <div
                      className="alert-row"
                      key={alert.id || alert._id || index}
                    >
                      <div className="alert-icon">
                        <CloudRain size={20} />
                      </div>

                      <div className="alert-details">
                        <strong>{alert.title || "Farm observation"}</strong>
                        <small>
                          {alert.location || "Location unavailable"} ·{" "}
                          {alert.date || "Date unavailable"}
                        </small>
                      </div>

                      <span
                        className={`severity ${
                          (alert.severity || "low").toLowerCase()
                        }`}
                      >
                        {alert.severity || "Info"}
                      </span>
                    </div>
                  ))
                )}
              </section>
            </>
          )}

          {/* FARM MONITORING */}
          {active === "Farm Monitoring" && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h3>Registered farms</h3>
                  <p>Your saved agricultural properties</p>
                </div>

                <button
                  className="save-farm-button"
                  onClick={() => setShowRegistration(true)}
                >
                  + Register farm
                </button>
              </div>

              {farm ? (
                <div>
                  <h3>{farm.farmerName || "Registered Farmer"}</h3>
                  <p>{farm.location}</p>
                  <p>
                    {farm.crop} · {farm.area} acres
                  </p>
                  <p>
                    Boundary points: {farm.boundary?.length || 0}
                  </p>
                </div>
              ) : (
                <p>No farms registered yet.</p>
              )}
            </section>
          )}

          {/* CROP HEALTH */}
          {active === "Crop Health" && (
            <DamageAssessment farm={farm} />
          )}

          {/* CROP INTELLIGENCE */}
          {active === "Crop Intelligence" && (
            <CropIntelligence farm={farm} />
          )}

          {/* SATELLITE MONITORING */}
          {active === "Satellite Monitoring" && (
            <SatelliteMonitoring farm={farm} />
          )}

          {/* DISASTER MONITORING */}
          {active === "Disaster Monitoring" && (
            <DisasterMonitoring />
          )}

          {/* DAMAGE ASSESSMENT */}
          {active === "Damage Assessment" && (
            <DamageAssessment farm={farm} />
          )}

          {/* INSURANCE CLAIMS */}
          {active === "Insurance Claims" && (
            <ClaimsManagement farm={farm} />
          )}

          {/* REPORTS */}
          {active === "Reports" && (
            <Reports farm={farm} />
          )}

          {/* VOICE ASSISTANT */}
          {active === "Voice Assistant" && (
            <VoiceAssistant />
          )}

          {/* ADMIN DASHBOARD */}
          {active === "Admin Dashboard" && (
            <AdminDashboard />
          )}

          <footer>
            CropGuard AI · Satellite-powered agricultural intelligence

            <span>
              Demo data only · Not an official insurance assessment
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, note, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>

      <p>{label}</p>
      <h2>{value}</h2>
      <small>{note}</small>
    </div>
  );
}

export default App;
