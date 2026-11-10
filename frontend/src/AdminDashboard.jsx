
import React, { useMemo, useState } from "react";
import {
  Users,
  Sprout,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  ShieldCheck,
  Eye,
  MapPin,
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [claims, setClaims] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedClaim, setSelectedClaim] = useState(null);

  const stats = useMemo(() => ({
    total: claims.length,
    pending: claims.filter(c => c.status === "Pending").length,
    approved: claims.filter(c => c.status === "Approved").length,
    rejected: claims.filter(c => c.status === "Rejected").length,
  }), [claims]);

  const filteredClaims = claims.filter(claim => {
    const farmer = (claim.farmer || "").toLowerCase();
    const id = (claim.id || "").toLowerCase();
    const location = (claim.location || "").toLowerCase();

    const matchesSearch =
      farmer.includes(search.toLowerCase()) ||
      id.includes(search.toLowerCase()) ||
      location.includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || claim.status === filter;

    return matchesSearch && matchesFilter;
  });

  const updateStatus = (id, status) => {
    setClaims(previous =>
      previous.map(claim =>
        claim.id === id ? { ...claim, status } : claim
      )
    );

    setSelectedClaim(null);
  };

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) {
      return "Not available";
    }

    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const formatDamage = (damage) => {
    return damage === undefined || damage === null
      ? "Not assessed"
      : `${damage}%`;
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">CROPGUARD CONTROL CENTER</span>
          <h1>Admin Dashboard</h1>
          <p>Manage farmers, monitor claims and review insurance requests.</p>
        </div>

        <div className="admin-role">
          <ShieldCheck size={19} />
          Insurance Officer
        </div>
      </div>

      <div className="admin-stats">
        <StatCard
          icon={<FileText />}
          label="Total Claims"
          value={stats.total}
        />

        <StatCard
          icon={<Clock />}
          label="Pending Review"
          value={stats.pending}
        />

        <StatCard
          icon={<CheckCircle />}
          label="Approved"
          value={stats.approved}
        />

        <StatCard
          icon={<XCircle />}
          label="Rejected"
          value={stats.rejected}
        />
      </div>

      <div className="admin-overview-grid">
        <div className="admin-info-card">
          <div className="admin-info-icon"><Users /></div>
          <div>
            <span>Registered Farmers</span>
            <h2>--</h2>
            <small>Data not available</small>
          </div>
        </div>

        <div className="admin-info-card">
          <div className="admin-info-icon"><Sprout /></div>
          <div>
            <span>Registered Farms</span>
            <h2>--</h2>
            <small>Data not available</small>
          </div>
        </div>

        <div className="admin-info-card">
          <div className="admin-info-icon"><MapPin /></div>
          <div>
            <span>Districts Covered</span>
            <h2>--</h2>
            <small>Data not available</small>
          </div>
        </div>
      </div>

      <div className="admin-claims-card">
        <div className="admin-table-header">
          <div>
            <h2>Insurance Claim Management</h2>
            <p>Review and manage submitted claims.</p>
          </div>
        </div>

        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={17} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search farmer, claim ID or location..."
            />
          </div>

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Farmer</th>
                <th>Location</th>
                <th>Crop / Disaster</th>
                <th>Damage</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredClaims.map(claim => (
                <tr key={claim.id}>
                  <td className="claim-id">
                    {claim.id || "Not available"}
                  </td>

                  <td>{claim.farmer || "Not available"}</td>

                  <td>{claim.location || "Not available"}</td>

                  <td>
                    <strong>{claim.crop || "Not available"}</strong>
                    <small className="table-subtext">
                      {claim.disaster || "Not available"}
                    </small>
                  </td>

                  <td>{formatDamage(claim.damage)}</td>

                  <td>{formatAmount(claim.amount)}</td>

                  <td>
                    <StatusBadge status={claim.status || "Pending"} />
                  </td>

                  <td>
                    <button
                      className="admin-view-button"
                      onClick={() => setSelectedClaim(claim)}
                    >
                      <Eye size={15} />
                      Review
                    </button>
                  </td>
                </tr>
              ))}

              {filteredClaims.length === 0 && (
                <tr>
                  <td colSpan="8" className="admin-empty">
                    {claims.length === 0
                      ? "No insurance claims available."
                      : "No matching claims found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedClaim && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedClaim(null)}
        >
          <div
            className="admin-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="admin-modal-heading">
              <div>
                <span>CLAIM REVIEW</span>
                <h2>{selectedClaim.id}</h2>
              </div>

              <button onClick={() => setSelectedClaim(null)}>×</button>
            </div>

            <div className="admin-detail-grid">
              <Detail label="Farmer" value={selectedClaim.farmer} />
              <Detail label="Location" value={selectedClaim.location} />
              <Detail label="Crop" value={selectedClaim.crop} />
              <Detail label="Disaster" value={selectedClaim.disaster} />
              <Detail
                label="Estimated damage"
                value={formatDamage(selectedClaim.damage)}
              />
              <Detail
                label="Requested amount"
                value={formatAmount(selectedClaim.amount)}
              />
            </div>

            <div className="admin-review-note">
              <ShieldCheck size={18} />
              <p>
                Review the supporting evidence and policy conditions before
                making a decision. Damage estimates should be verified before
                making a claim decision.
              </p>
            </div>

            <div className="admin-modal-actions">
              <button
                className="admin-reject"
                onClick={() => updateStatus(selectedClaim.id, "Rejected")}
              >
                Reject
              </button>

              <button
                className="admin-review"
                onClick={() => updateStatus(selectedClaim.id, "Under Review")}
              >
                Under Review
              </button>

              <button
                className="admin-approve"
                onClick={() => updateStatus(selectedClaim.id, "Approved")}
              >
                Approve
              </button>
            </div>

            <p className="admin-demo-warning">
              Status changes are temporary and are not saved to the database.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const className = status.toLowerCase().replaceAll(" ", "-");

  return (
    <span className={`admin-status ${className}`}>
      {status}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div className="admin-detail">
      <span>{label}</span>
      <strong>{value || "Not available"}</strong>
    </div>
  );
}
