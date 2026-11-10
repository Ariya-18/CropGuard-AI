
import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  RefreshCw,
  ShieldCheck,
  MapPin,
  Sprout,
  AlertTriangle
} from "lucide-react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

export default function Reports({ farm }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API}/claims`);
      const data = response.data.claims || [];

      setClaims(data);
      setSelectedClaim(data.length > 0 ? data[0] : null);
    } catch (err) {
      setError("Unable to load reports. Check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const downloadReport = () => {
    window.print();
  };

  const getClaimId = (id) => `CG-${id?.slice(-6).toUpperCase() || "N/A"}`;

  const formatValue = (value, suffix = "") => {
    if (value === undefined || value === null || value === "") {
      return "Not available";
    }
    return `${value}${suffix}`;
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "Not available"
      : parsedDate.toLocaleDateString();
  };

  return (
    <div className="reports-page">
      <div className="reports-heading no-print">
        <div>
          <p className="eyebrow">DOCUMENT CENTRE</p>
          <h2>Farm Reports</h2>
          <p className="muted">
            View and export available crop damage claim reports.
          </p>
        </div>

        <button className="clear-button" onClick={loadReports}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="report-summary-grid no-print">
        <div className="report-summary-card">
          <FileText color="#269b65" />
          <small>Total claims</small>
          <strong>{claims.length}</strong>
        </div>

        <div className="report-summary-card">
          <ShieldCheck color="#4b83cb" />
          <small>Approved claims</small>
          <strong>
            {claims.filter(c => c.status === "Approved").length}
          </strong>
        </div>

        <div className="report-summary-card">
          <AlertTriangle color="#d28a35" />
          <small>Pending review</small>
          <strong>
            {claims.filter(
              c => c.status === "Pending" || c.status === "Under Review"
            ).length}
          </strong>
        </div>
      </div>

      {loading ? (
        <div className="panel">
          <p>Loading reports...</p>
        </div>
      ) : error ? (
        <div className="panel">
          <p>{error}</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="panel empty-reports">
          <FileText size={42} color="#269b65" />
          <h3>No reports available</h3>
          <p className="muted">
            Submit a preliminary insurance claim to generate your first report.
          </p>
        </div>
      ) : (
        <>
          <div className="panel report-selector no-print">
            <h3>Select a report</h3>

            <select
              value={selectedClaim?._id || ""}
              onChange={(e) => {
                const claim = claims.find(c => c._id === e.target.value);
                setSelectedClaim(claim || null);
              }}
            >
              {claims.map(claim => (
                <option key={claim._id} value={claim._id}>
                  {getClaimId(claim._id)} · {claim.disaster || "Claim"}
                </option>
              ))}
            </select>
          </div>

          {selectedClaim && (
            <div className="panel printable-report" id="printable-report">
              <div className="print-report-header">
                <div className="report-brand">
                  <Sprout size={30} color="#269b65" />
                  <div>
                    <h2>CropGuard AI</h2>
                    <small>INTELLIGENT AGRICULTURE</small>
                  </div>
                </div>

                <span className="report-tag">CLAIM REPORT</span>
              </div>

              <div className="report-title">
                <p>AGRICULTURAL INTELLIGENCE REPORT</p>
                <h2>Preliminary Crop Damage Assessment</h2>
                <small>
                  Report ID: {getClaimId(selectedClaim._id)}
                </small>
              </div>

              <div className="report-section">
                <h3><MapPin size={17} /> Farm information</h3>

                <div className="report-data-grid">
                  <ReportField
                    label="Farmer"
                    value={selectedClaim.farmerName}
                  />
                  <ReportField
                    label="Location"
                    value={selectedClaim.location}
                  />
                  <ReportField
                    label="Crop"
                    value={selectedClaim.crop}
                  />
                  <ReportField
                    label="Farm area"
                    value={formatValue(selectedClaim.farmArea, " acres")}
                  />
                </div>
              </div>

              <div className="report-section">
                <h3><AlertTriangle size={17} /> Damage assessment</h3>

                <div className="report-data-grid">
                  <ReportField
                    label="Disaster type"
                    value={selectedClaim.disaster}
                  />
                  <ReportField
                    label="Estimated damage"
                    value={formatValue(selectedClaim.damagePercentage, "%")}
                  />
                  <ReportField
                    label="Affected area"
                    value={formatValue(selectedClaim.affectedArea, " acres")}
                  />
                  <ReportField
                    label="Assessment date"
                    value={formatDate(selectedClaim.createdAt)}
                  />
                </div>
              </div>

              <div className="report-section">
                <h3><ShieldCheck size={17} /> Claim information</h3>

                <div className="report-data-grid">
                  <ReportField
                    label="Claim reference"
                    value={getClaimId(selectedClaim._id)}
                  />
                  <ReportField
                    label="Current status"
                    value={selectedClaim.status}
                  />
                </div>
              </div>

              <div className="report-notice">
                <strong>Important notice</strong>
                <p>
                  This document presents the claim information currently
                  available in CropGuard AI. Damage estimates are displayed
                  only when assessment data is available. Missing values
                  have not been estimated or assumed. This is a preliminary
                  report, not an official insurance assessment or guarantee
                  of claim approval or payment. Final decisions require
                  verification by the authorised insurer.
                </p>
              </div>

              <div className="report-footer">
                <span>Generated by CropGuard AI</span>
                <span>
                  Generated on {new Date().toLocaleDateString()}
                </span>
              </div>

              <button
                className="save-farm-button download-report no-print"
                onClick={downloadReport}
              >
                <Download size={17} />
                Download PDF
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ReportField({ label, value }) {
  return (
    <div className="report-field">
      <small>{label}</small>
      <strong>{value || "Not available"}</strong>
    </div>
  );
}
