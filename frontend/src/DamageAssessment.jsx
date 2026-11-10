
import { useState } from "react";
import {
  Satellite,
  CloudRain,
  Activity,
  AlertTriangle,
  FileText,
  Play,
  MapPin,
  Info
} from "lucide-react";
import "./App.css";

export default function DamageAssessment({ farm }) {
  const [assessed, setAssessed] = useState(false);
  const [disaster, setDisaster] = useState("Flood");

  const area = farm?.area;

  return (
    <div className="damage-page">

      {/* HEADER */}
      <div className="damage-heading">
        <div>
          <p className="eyebrow">CROP INTELLIGENCE</p>
          <h2>Crop Damage Assessment</h2>
          <p className="muted">
            Compare crop conditions and prepare preliminary damage evidence.
          </p>
        </div>

        <span className="demo-label">
          LIVE ANALYSIS PENDING
        </span>
      </div>

      {/* FARM DETAILS */}
      <div className="panel damage-farm">
        <MapPin color="#269b65" />
        <div>
          <strong>{farm?.location || "Location not available"}</strong>
          <p>
            {farm?.crop || "Crop not available"}
            {area ? ` · ${area} acres` : ""}
          </p>
        </div>
      </div>

      {/* SATELLITE IMAGE COMPARISON */}
      <div className="panel damage-panel">
        <div className="panel-heading">
          <div>
            <h3>Satellite image comparison</h3>
            <p>Actual satellite observations</p>
          </div>
          <Satellite color="#269b65" />
        </div>

        <div className="image-comparison">

          <div className="satellite-sample healthy-image">
            <span>BEFORE EVENT</span>
            <div className="satellite-image-placeholder">
              <Satellite size={35} />
              <p>No satellite image available</p>
            </div>
          </div>

          <div className="satellite-sample damaged-image">
            <span>AFTER EVENT</span>
            <div className="satellite-image-placeholder">
              <Satellite size={35} />
              <p>No satellite image available</p>
            </div>
          </div>

        </div>

        <p className="sample-disclaimer">
          Satellite imagery will appear here when actual observations
          are retrieved for the registered farm and selected dates.
        </p>
      </div>

      {/* ASSESSMENT CONTROLS */}
      <div className="panel assessment-controls">
        <h3>Run damage assessment</h3>
        <p className="muted">
          Select the disaster type for a future satellite-based assessment.
        </p>

        <label className="damage-label">Disaster type</label>

        <select
          value={disaster}
          onChange={(e) => {
            setDisaster(e.target.value);
            setAssessed(false);
          }}
          className="damage-select"
        >
          <option>Flood</option>
          <option>Drought</option>
          <option>Wildfire</option>
        </select>

        <button
          className="save-farm-button run-assessment"
          onClick={() => setAssessed(true)}
        >
          <Play size={17} />
          Check assessment availability
        </button>
      </div>

      {/* EMPTY ASSESSMENT STATE */}
      {assessed && (
        <div className="assessment-results">

          <div className="result-heading">
            <div>
              <span className="live-tag">
                ANALYSIS PENDING
              </span>
              <h3>Damage assessment unavailable</h3>
            </div>
            <AlertTriangle color="#d28a35" size={25} />
          </div>

          <div className="result-grid">

            <div className="result-card">
              <Activity color="#d28a35" />
              <small>Estimated damage</small>
              <strong>--</strong>
            </div>

            <div className="result-card">
              <AlertTriangle color="#d28a35" />
              <small>Affected area</small>
              <strong>--</strong>
            </div>

            <div className="result-card">
              <CloudRain color="#4b83cb" />
              <small>Selected disaster</small>
              <strong>{disaster}</strong>
            </div>

          </div>

          <div className="panel report-panel">
            <h3>
              <FileText size={18} /> Assessment summary
            </h3>

            <p>
              A {disaster.toLowerCase()} assessment has been requested
              for the registered farm. Verified satellite observations
              and damage analysis are not currently available.
            </p>

            <strong className="report-warning">
              No damage percentage or insurance claim evidence
              can be generated until real observations are analysed.
            </strong>
          </div>

        </div>
      )}

      {/* INFORMATION */}
      <div className="disaster-notice">
        <Info size={18} />
        <p>
          Damage assessment requires actual before-and-after satellite
          observations, suitable analysis methods and ground verification.
          Satellite imagery alone cannot establish an insurance claim decision.
        </p>
      </div>

    </div>
  );
}
