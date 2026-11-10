
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Satellite,
  Layers,
  Activity,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

const API = "http://localhost:5000/api";

function getFarmBoundary(farm) {
  const points = farm?.boundaryPoints || farm?.boundary || [];

  if (!Array.isArray(points)) return [];

  return points
    .map((point) => {
      if (Array.isArray(point)) {
        return {
          lat: Number(point[0]),
          lng: Number(point[1]),
        };
      }

      return {
        lat: Number(point.lat ?? point.latitude),
        lng: Number(point.lng ?? point.longitude),
      };
    })
    .filter(
      (point) =>
        Number.isFinite(point.lat) &&
        Number.isFinite(point.lng)
    );
}

function SatelliteMonitoring({ farm }) {
  const [activeTab, setActiveTab] = useState("comparison");

  const [beforeFrom, setBeforeFrom] = useState("");
  const [beforeTo, setBeforeTo] = useState("");
  const [afterFrom, setAfterFrom] = useState("");
  const [afterTo, setAfterTo] = useState("");

  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [opacity, setOpacity] = useState(50);

  const boundaryPoints = useMemo(
    () => getFarmBoundary(farm),
    [farm]
  );

  useEffect(() => {
    return () => {
      if (beforeImage) URL.revokeObjectURL(beforeImage);
      if (afterImage) URL.revokeObjectURL(afterImage);
    };
  }, [beforeImage, afterImage]);

  const validateDates = () => {
    if (!beforeFrom || !beforeTo || !afterFrom || !afterTo) {
      return "Please select all four dates.";
    }

    if (
      new Date(beforeFrom) > new Date(beforeTo) ||
      new Date(afterFrom) > new Date(afterTo)
    ) {
      return "Start date cannot be after end date.";
    }

    if (new Date(beforeTo) >= new Date(afterFrom)) {
      return "The Before date range must end before the After date range starts.";
    }

    if (
      new Date(afterTo) >
      new Date().setHours(23, 59, 59, 999)
    ) {
      return "Please select dates that have already passed.";
    }

    return "";
  };

  const fetchSatelliteImage = async (from, to) => {
    const response = await axios.post(
      `${API}/satellite/image`,
      {
        boundaryPoints,
        from,
        to,
      },
      {
        responseType: "blob",
        timeout: 70000,
      }
    );

    if (!response.data || response.data.size === 0) {
      throw new Error("The satellite API returned an empty image.");
    }

    if (!response.headers["content-type"]?.includes("image")) {
      throw new Error("The server did not return a valid image.");
    }

    return URL.createObjectURL(response.data);
  };

  const loadSatelliteImages = async () => {
    setError("");
    setSuccess("");

    if (boundaryPoints.length < 3) {
      setError(
        "Farm boundary is missing. Please register at least 3 boundary points."
      );
      return;
    }

    const dateError = validateDates();

    if (dateError) {
      setError(dateError);
      return;
    }

    setLoading(true);

    let newBeforeImage = "";
    let newAfterImage = "";

    try {
      const results = await Promise.all([
        fetchSatelliteImage(beforeFrom, beforeTo),
        fetchSatelliteImage(afterFrom, afterTo),
      ]);

      newBeforeImage = results[0];
      newAfterImage = results[1];

      setBeforeImage(newBeforeImage);
      setAfterImage(newAfterImage);

      setSuccess("Satellite images retrieved successfully.");
    } catch (err) {
      if (newBeforeImage) URL.revokeObjectURL(newBeforeImage);
      if (newAfterImage) URL.revokeObjectURL(newAfterImage);

      console.error("Satellite image error:", err);

      setError(
        err.message ||
        "Unable to retrieve satellite imagery. Please try another date range."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetImages = () => {
    setBeforeImage("");
    setAfterImage("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="satellite-monitoring">

      <div className="page-header">
        <div>
          <h1>Satellite Monitoring</h1>
          <p>
            Monitor your registered farm using satellite observations.
          </p>
        </div>

        <div className="satellite-header-icon">
          <Satellite size={28} />
        </div>
      </div>

      <div className="satellite-farm-info">
        <div>
          <span>Farm Name</span>
          <strong>
            {farm?.farmName || farm?.name || "Not available"}
          </strong>
        </div>

        <div>
          <span>Crop</span>
          <strong>{farm?.crop || "Not available"}</strong>
        </div>

        <div>
          <span>Farm Area</span>
          <strong>
            {farm?.area ? `${farm.area} acres` : "Not available"}
          </strong>
        </div>

        <div>
          <span>Boundary Points</span>
          <strong>{boundaryPoints.length}</strong>
        </div>
      </div>

      <div className="satellite-tabs">
        <button
          className={activeTab === "comparison" ? "active" : ""}
          onClick={() => setActiveTab("comparison")}
        >
          <Layers size={17} />
          Image comparison
        </button>

        <button
          className={activeTab === "health" ? "active" : ""}
          onClick={() => setActiveTab("health")}
        >
          <Activity size={17} />
          Crop health
        </button>
      </div>

      {activeTab === "comparison" && (
        <div className="satellite-card">

          <div className="satellite-card-header">
            <div>
              <h3>Satellite image comparison</h3>
              <p>
                Compare Sentinel-2 observations from two date ranges.
              </p>
            </div>

            <Satellite size={22} />
          </div>

          <div className="satellite-date-controls">

            <div className="date-group">
              <h4>Before observation</h4>

              <label>Start date</label>
              <input
                type="date"
                value={beforeFrom}
                onChange={(e) => setBeforeFrom(e.target.value)}
              />

              <label>End date</label>
              <input
                type="date"
                value={beforeTo}
                onChange={(e) => setBeforeTo(e.target.value)}
              />
            </div>

            <div className="date-group">
              <h4>After observation</h4>

              <label>Start date</label>
              <input
                type="date"
                value={afterFrom}
                onChange={(e) => setAfterFrom(e.target.value)}
              />

              <label>End date</label>
              <input
                type="date"
                value={afterTo}
                onChange={(e) => setAfterTo(e.target.value)}
              />
            </div>

          </div>

          <div className="satellite-actions">
            <button
              className="satellite-load-button"
              onClick={loadSatelliteImages}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="spin" size={17} />
                  Retrieving satellite images...
                </>
              ) : (
                <>
                  <Satellite size={17} />
                  Load satellite images
                </>
              )}
            </button>

            <button
              className="satellite-reset-button"
              onClick={resetImages}
              disabled={loading}
            >
              Reset
            </button>
          </div>

          {error && (
            <div className="satellite-message error">
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          {success && (
            <div className="satellite-message success">
              <Activity size={17} />
              {success}
            </div>
          )}

          <div className="satellite-images-grid">

            <div className="satellite-image-panel">
              <div className="satellite-image-heading">
                <span>BEFORE</span>
                <small>
                  {beforeFrom && beforeTo
                    ? `${beforeFrom} to ${beforeTo}`
                    : "Dates not selected"}
                </small>
              </div>

              <div className="satellite-image-container">
                {beforeImage ? (
                  <img
                    src={beforeImage}
                    alt="Earlier Sentinel-2 observation"
                    style={{ opacity: opacity / 100 }}
                  />
                ) : (
                  <div className="satellite-placeholder">
                    <ImageIcon size={35} />
                    <p>No satellite image available</p>
                    <small>Select dates and request imagery</small>
                  </div>
                )}
              </div>

              <p className="satellite-image-caption">
                Earlier satellite observation
              </p>
            </div>

            <div className="satellite-image-panel">
              <div className="satellite-image-heading">
                <span>AFTER</span>
                <small>
                  {afterFrom && afterTo
                    ? `${afterFrom} to ${afterTo}`
                    : "Dates not selected"}
                </small>
              </div>

              <div className="satellite-image-container">
                {afterImage ? (
                  <img
                    src={afterImage}
                    alt="Later Sentinel-2 observation"
                  />
                ) : (
                  <div className="satellite-placeholder">
                    <ImageIcon size={35} />
                    <p>No satellite image available</p>
                    <small>Select dates and request imagery</small>
                  </div>
                )}
              </div>

              <p className="satellite-image-caption">
                Later satellite observation
              </p>
            </div>

          </div>

          {beforeImage && afterImage && (
            <div className="satellite-opacity-control">
              <label>Before image opacity</label>

              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) =>
                  setOpacity(Number(e.target.value))
                }
              />

              <strong>{opacity}%</strong>
            </div>
          )}

          <div className="satellite-disclaimer">
            <AlertCircle size={15} />
            {beforeImage && afterImage
              ? "Images retrieved from the Sentinel-2 L2A data service. These are satellite observations, not live imagery."
              : "No satellite observations have been retrieved yet."}
          </div>

        </div>
      )}

      {activeTab === "health" && (
        <div className="satellite-card">

          <div className="satellite-card-header">
            <div>
              <h3>Crop health monitoring</h3>
              <p>
                Vegetation health analysis using satellite observations.
              </p>
            </div>

            <Activity size={22} />
          </div>

          <div className="satellite-health-placeholder">
            <Activity size={40} />
            <h3>NDVI analysis not available yet</h3>
            <p>
              No crop-health measurements are currently available.
              NDVI calculation and historical vegetation comparison
              have not yet been integrated.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}

export default SatelliteMonitoring;
