
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  FileText,
  RefreshCw,
  Send,
  Info
} from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function ClaimsManagement({ farm }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [disaster, setDisaster] = useState("Flood");

  const farmArea = farm?.area ?? "";

  const loadClaims = async () => {
    try {
      const response = await axios.get(`${API}/claims`);
      setClaims(response.data.claims || []);
      setMessage("");
    } catch (error) {
      setMessage("Unable to load claims. Check the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const submitClaim = async () => {
    if (!farm) {
      setMessage("Register a farm before submitting a claim.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const response = await axios.post(`${API}/claims`, {
        farmerName: farm.farmerName,
        location: farm.location,
        crop: farm.crop,
        disaster,
        farmArea: farmArea || undefined
      });

      setMessage(response.data.message || "Claim submitted successfully.");
      await loadClaims();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Claim submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/claims/${id}/status`, { status });
      await loadClaims();
      setMessage(`Claim status updated to ${status}.`);
    } catch (error) {
      setMessage("Unable to update claim status.");
    }
  };

  const statusClass = (status) =>
    (status || "pending").toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="claims-page">

      {/* HEADER */}
      <div className="claims-heading">
        <div>
          <p className="eyebrow">INSURANCE MANAGEMENT</p>
          <h2>Insurance Claims</h2>
          <p className="muted">
            Submit preliminary claims and review their progress.
          </p>
        </div>

        <ShieldCheck size={32} color="#269b65" />
      </div>

      {/* CREATE CLAIM */}
      <div className="panel claim-create-panel">
        <h3>
          <FileText size={18} /> Create preliminary claim
        </h3>

        <p className="muted">
          Submit a claim using your registered farm details.
        </p>

        <div className="claim-form-grid">

          <label>
            Farmer
            <input
              value={farm?.farmerName || "No farmer registered"}
              readOnly
            />
          </label>

          <label>
            Farm location
            <input
              value={farm?.location || "Not available"}
              readOnly
            />
          </label>

          <label>
            Crop
            <input
              value={farm?.crop || "Not available"}
              readOnly
            />
          </label>

          <label>
            Farm area (acres)
            <input
              value={farmArea || "Not available"}
              readOnly
            />
          </label>

          <label>
            Disaster type
            <select
              value={disaster}
              onChange={(e) => setDisaster(e.target.value)}
            >
              <option>Flood</option>
              <option>Drought</option>
              <option>Wildfire</option>
            </select>
          </label>

        </div>

        <div className="claim-estimate">
          Damage assessment:
          <strong> Awaiting verified satellite analysis</strong>
        </div>

        <button
          className="save-farm-button"
          onClick={submitClaim}
          disabled={submitting || !farm}
        >
          <Send size={16} />
          {submitting ? "Submitting..." : "Submit preliminary claim"}
        </button>

        <p className="claim-disclaimer">
          Damage percentage and affected area will be added only
          when verified assessment results are available.
          Claim submission does not guarantee insurance approval.
        </p>
      </div>

      {message && (
        <div className="form-message">{message}</div>
      )}

      {/* CLAIM HISTORY */}
      <div className="panel claims-list-panel">
        <div className="panel-heading">
          <div>
            <h3>Claim review dashboard</h3>
            <p>Claims stored in the CropGuard database</p>
          </div>

          <button
            className="clear-button"
            onClick={loadClaims}
            disabled={loading}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <p className="muted">Loading claims...</p>
        ) : claims.length === 0 ? (
          <div className="claims-empty-state">
            <FileText size={35} />
            <h3>No claims submitted yet</h3>
            <p>
              Submitted claims will appear here.
            </p>
          </div>
        ) : (
          <div className="claims-list">

            {claims.map((claim) => (
              <div className="claim-card" key={claim._id}>

                <div className="claim-card-top">
                  <div>
                    <strong>
                      CG-{claim._id.slice(-6).toUpperCase()}
                    </strong>
                    <small>
                      {claim.createdAt
                        ? new Date(claim.createdAt).toLocaleDateString()
                        : "Date unavailable"}
                    </small>
                  </div>

                  <span
                    className={`claim-status ${statusClass(claim.status)}`}
                  >
                    {claim.status || "Pending"}
                  </span>
                </div>

                <div className="claim-details-grid">

                  <div>
                    <small>Farmer</small>
                    <strong>{claim.farmerName || "--"}</strong>
                  </div>

                  <div>
                    <small>Location</small>
                    <strong>{claim.location || "--"}</strong>
                  </div>

                  <div>
                    <small>Crop</small>
                    <strong>{claim.crop || "--"}</strong>
                  </div>

                  <div>
                    <small>Disaster</small>
                    <strong>{claim.disaster || "--"}</strong>
                  </div>

                  <div>
                    <small>Damage estimate</small>
                    <strong>
                      {claim.damagePercentage != null
                        ? `${claim.damagePercentage}%`
                        : "Not assessed"}
                    </strong>
                  </div>

                  <div>
                    <small>Affected area</small>
                    <strong>
                      {claim.affectedArea != null
                        ? `${claim.affectedArea} acres`
                        : "Not assessed"}
                    </strong>
                  </div>

                </div>

                <div className="officer-actions">
                  <label>Officer review status</label>

                  <select
                    value={claim.status || "Pending"}
                    onChange={(e) =>
                      updateStatus(claim._id, e.target.value)
                    }
                  >
                    <option>Pending</option>
                    <option>Under Review</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>
                </div>

                <small className="claim-demo-note">
                  Final approval requires official insurer verification.
                </small>

              </div>
            ))}

          </div>
        )}
      </div>

      <div className="disaster-notice">
        <Info size={18} />
        <p>
          CropGuard AI supports preliminary claim management.
          Insurance approval and settlement are determined by
          the authorised insurance provider.
        </p>
      </div>

    </div>
  );
}
