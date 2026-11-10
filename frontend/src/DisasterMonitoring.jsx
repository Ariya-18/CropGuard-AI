import { useState } from "react";
import {
  CloudRain,
  Flame,
  Wind,
  Waves,
  Mountain,
  AlertTriangle,
  MapPin,
  CalendarDays,
  Activity,
  Filter,
  RefreshCw,
  ShieldAlert,
  Info
} from "lucide-react";
import "./App.css";

const demoEvents = [
  {
    id: "EVT001",
    title: "Heavy rainfall and possible flooding",
    type: "Flood",
    location: "Coimbatore, Tamil Nadu",
    date: "2026-11-10",
    severity: "High",
    affectedArea: 1.2,
    damage: 35,
    status: "Under Observation",
    description:
      "Illustrative scenario showing possible waterlogging in agricultural land."
  },
  {
    id: "EVT002",
    title: "Prolonged dry weather",
    type: "Drought",
    location: "Tiruppur, Tamil Nadu",
    date: "2026-11-08",
    severity: "Moderate",
    affectedArea: 2.1,
    damage: 18,
    status: "Monitoring",
    description:
      "Sample drought-risk scenario based on hypothetical rainfall conditions."
  },
  {
    id: "EVT003",
    title: "Vegetation loss near agricultural land",
    type: "Wildfire",
    location: "Erode, Tamil Nadu",
    date: "2026-11-05",
    severity: "High",
    affectedArea: 0.8,
    damage: 42,
    status: "Review Required",
    description:
      "Illustrative vegetation-change event requiring ground verification."
  },
  {
    id: "EVT004",
    title: "Strong wind and rainfall conditions",
    type: "Cyclone",
    location: "Thanjavur, Tamil Nadu",
    date: "2026-11-02",
    severity: "Low",
    affectedArea: 0.4,
    damage: 8,
    status: "Monitoring",
    description:
      "Sample weather-impact scenario for agricultural monitoring."
  },
  {
    id: "EVT005",
    title: "Slope instability risk",
    type: "Landslide",
    location: "Nilgiris, Tamil Nadu",
    date: "2026-10-28",
    severity: "Moderate",
    affectedArea: 0.6,
    damage: 22,
    status: "Under Observation",
    description:
      "Illustrative terrain-risk scenario requiring authoritative confirmation."
  }
];

const disasterIcons = {
  Flood: Waves,
  Drought: SunIcon,
  Wildfire: Flame,
  Cyclone: Wind,
  Landslide: Mountain
};

function SunIcon(props) {
  return <Activity {...props} />;
}

export default function DisasterMonitoring() {
  const [events, setEvents] = useState(demoEvents);
  const [filter, setFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredEvents =
    filter === "All"
      ? events
      : events.filter(event => event.type === filter);

  const highRiskCount = events.filter(
    event => event.severity === "High"
  ).length;

  const totalAffected = events.reduce(
    (total, event) => total + event.affectedArea,
    0
  );

  const refreshEvents = () => {
    setEvents([...demoEvents]);
    setSelectedEvent(null);
  };

  return (
    <div className="disaster-page">

      {/* HEADER */}
      <div className="disaster-heading">
        <div>
          <p className="eyebrow">ENVIRONMENTAL RISK INTELLIGENCE</p>
          <h2>Disaster Monitoring</h2>
          <p className="muted">
            Track potential natural hazards affecting agricultural regions.
          </p>
        </div>

        <span className="disaster-demo-badge">
          DEMO EVENT DATA
        </span>
      </div>

      {/* SUMMARY */}
      <div className="disaster-stats">

        <div className="disaster-stat-card">
          <div className="disaster-stat-icon red">
            <AlertTriangle />
          </div>
          <small>High severity events</small>
          <h2>{highRiskCount}</h2>
        </div>

        <div className="disaster-stat-card">
          <div className="disaster-stat-icon blue">
            <Waves />
          </div>
          <small>Events monitored</small>
          <h2>{events.length}</h2>
        </div>

        <div className="disaster-stat-card">
          <div className="disaster-stat-icon green">
            <MapPin />
          </div>
          <small>Sample affected area</small>
          <h2>{totalAffected.toFixed(1)} ac</h2>
        </div>

        <div className="disaster-stat-card">
          <div className="disaster-stat-icon purple">
            <ShieldAlert />
          </div>
          <small>Monitoring status</small>
          <h2>Active</h2>
        </div>

      </div>

      {/* FILTER */}
      <div className="panel disaster-filter-panel">
        <div className="panel-heading">
          <div>
            <h3><Filter size={17} /> Filter disaster events</h3>
            <p>Choose a hazard category</p>
          </div>

          <button
            className="clear-button"
            onClick={refreshEvents}
          >
            <RefreshCw size={15} /> Reset
          </button>
        </div>

        <div className="disaster-filter-buttons">
          {[
            "All",
            "Flood",
            "Drought",
            "Wildfire",
            "Cyclone",
            "Landslide"
          ].map(type => (
            <button
              key={type}
              className={filter === type ? "selected" : ""}
              onClick={() => {
                setFilter(type);
                setSelectedEvent(null);
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* EVENT LIST AND DETAILS */}
      <div className="disaster-content-grid">

        <div className="panel disaster-events-panel">
          <div className="panel-heading">
            <div>
              <h3>Detected event scenarios</h3>
              <p>{filteredEvents.length} sample events</p>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="muted">No events in this category.</p>
          ) : (
            filteredEvents.map(event => {
              const Icon = disasterIcons[event.type];

              return (
                <button
                  className={`disaster-event-row ${
                    selectedEvent?.id === event.id ? "active" : ""
                  }`}
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="disaster-event-icon">
                    <Icon size={21} />
                  </div>

                  <div className="disaster-event-info">
                    <strong>{event.title}</strong>
                    <small>
                      {event.location} · {event.date}
                    </small>
                    <span className={`severity ${event.severity.toLowerCase()}`}>
                      {event.severity} severity
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* DETAILS */}
        <div className="panel disaster-details-panel">
          {selectedEvent ? (
            <>
              <div className="panel-heading">
                <div>
                  <h3>Event details</h3>
                  <p>{selectedEvent.id}</p>
                </div>

                <AlertTriangle color="#d28a35" />
              </div>

              <h3 className="selected-event-title">
                {selectedEvent.title}
              </h3>

              <p className="selected-event-description">
                {selectedEvent.description}
              </p>

              <div className="disaster-detail-item">
                <MapPin size={17} />
                <div>
                  <small>Location</small>
                  <strong>{selectedEvent.location}</strong>
                </div>
              </div>

              <div className="disaster-detail-item">
                <CalendarDays size={17} />
                <div>
                  <small>Observation date</small>
                  <strong>{selectedEvent.date}</strong>
                </div>
              </div>

              <div className="disaster-detail-item">
                <Activity size={17} />
                <div>
                  <small>Estimated affected area</small>
                  <strong>{selectedEvent.affectedArea} acres</strong>
                </div>
              </div>

              <div className="disaster-detail-item">
                <AlertTriangle size={17} />
                <div>
                  <small>Illustrative damage indicator</small>
                  <strong>{selectedEvent.damage}%</strong>
                </div>
              </div>

              <div className="disaster-detail-status">
                <small>Monitoring status</small>
                <strong>{selectedEvent.status}</strong>
              </div>
            </>
          ) : (
            <div className="disaster-empty-details">
              <Activity size={40} />
              <h3>Select an event</h3>
              <p>
                Select a disaster scenario to view its details.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* HAZARD CAPABILITIES */}
      <div className="panel hazard-capabilities">
        <div className="panel-heading">
          <div>
            <h3>Disaster intelligence capabilities</h3>
            <p>Potential monitoring methods</p>
          </div>
        </div>

        <div className="hazard-grid">
          <HazardCard
            icon={<Waves />}
            title="Flood"
            method="Sentinel-1 radar and water extent analysis"
          />

          <HazardCard
            icon={<Activity />}
            title="Drought"
            method="Vegetation trends and rainfall indicators"
          />

          <HazardCard
            icon={<Flame />}
            title="Wildfire"
            method="Thermal hotspots and burn-area indicators"
          />

          <HazardCard
            icon={<Wind />}
            title="Cyclone"
            method="Weather alerts and post-event crop assessment"
          />

          <HazardCard
            icon={<Mountain />}
            title="Landslide"
            method="Terrain, rainfall and change indicators"
          />
        </div>
      </div>

      {/* NOTICE */}
      <div className="disaster-notice">
        <Info size={18} />
        <p>
          All events, dates, severity classifications and affected-area
          values on this page are fictional demonstration data. Actual
          hazard detection requires satellite observations, authoritative
          weather or disaster datasets and independent verification.
          Satellite imagery alone cannot reliably identify every type
          of crop damage.
        </p>
      </div>

      <footer className="disaster-footer">
        CropGuard AI · Natural disaster intelligence
        <span>Demo environment · Sample events only</span>
      </footer>

    </div>
  );
}

function HazardCard({ icon, title, method }) {
  return (
    <div className="hazard-card">
      <div className="hazard-card-icon">{icon}</div>
      <strong>{title}</strong>
      <p>{method}</p>
    </div>
  );
}
