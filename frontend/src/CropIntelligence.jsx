
import { useState } from "react";
import {
  Sprout,
  Activity,
  Droplets,
  Sun,
  AlertTriangle,
  CalendarDays,
  Leaf,
  Info
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import "./App.css";

export default function CropIntelligence({ farm }) {
  const [period, setPeriod] = useState("7 days");

  const crop = farm?.crop || "Not available";
  const location = farm?.location || "Not available";
  const area = farm?.area;

  // No verified satellite analysis is connected yet.
  const healthScore = null;
  const ndvi = null;
  const healthHistory = [];

  const recommendations = [
    {
      icon: Droplets,
      title: "Monitor soil moisture",
      description:
        "Check soil moisture regularly and maintain suitable irrigation."
    },
    {
      icon: Leaf,
      title: "Inspect crop leaves",
      description:
        "Look for yellowing, leaf damage or unusual growth patterns."
    },
    {
      icon: Sun,
      title: "Track weather conditions",
      description:
        "Review rainfall and temperature changes during the growing season."
    }
  ];

  return (
    <div className="crop-intelligence">

      {/* HEADER */}
      <div className="intelligence-heading">
        <div>
          <p className="eyebrow">AGRICULTURAL ANALYTICS</p>
          <h2>Crop Intelligence</h2>
          <p className="muted">
            Understand vegetation health and identify possible crop stress.
          </p>
        </div>

        <span className="intelligence-demo-tag">
          LIVE DATA PENDING
        </span>
      </div>

      {/* FARM SUMMARY */}
      <div className="panel intelligence-farm">
        <div className="intelligence-farm-icon">
          <Sprout size={25} />
        </div>

        <div>
          <small>REGISTERED FARM</small>
          <h3>{location}</h3>
          <p>
            {crop} plantation
            {area ? ` · ${area} acres` : ""}
          </p>
        </div>
      </div>

      {/* METRICS */}
      <div className="intelligence-metrics">

        <div className="intelligence-card">
          <div className="intelligence-icon green">
            <Leaf />
          </div>
          <small>Crop health score</small>
          <h2>--</h2>
          <span className="metric-neutral">
            Awaiting satellite analysis
          </span>
        </div>

        <div className="intelligence-card">
          <div className="intelligence-icon blue">
            <Activity />
          </div>
          <small>NDVI indicator</small>
          <h2>--</h2>
          <span className="metric-neutral">
            No observation available
          </span>
        </div>

        <div className="intelligence-card">
          <div className="intelligence-icon orange">
            <AlertTriangle />
          </div>
          <small>Stress indicators</small>
          <h2>--</h2>
          <span className="metric-neutral">
            Analysis pending
          </span>
        </div>

        <div className="intelligence-card">
          <div className="intelligence-icon purple">
            <CalendarDays />
          </div>
          <small>Last observation</small>
          <h2>--</h2>
          <span className="metric-neutral">
            No observation recorded
          </span>
        </div>

      </div>

      {/* NDVI EXPLANATION */}
      <div className="panel ndvi-panel">
        <div className="panel-heading">
          <div>
            <h3>Understanding NDVI</h3>
            <p>Normalized Difference Vegetation Index</p>
          </div>
          <Activity color="#269b65" />
        </div>

        <div className="ndvi-value">
          <div>
            <strong>--</strong>
            <small>No measured NDVI value</small>
          </div>

          <span className="ndvi-status">
            Awaiting satellite data
          </span>
        </div>

        <div className="ndvi-scale">
          <div className="ndvi-gradient" />
          <div className="ndvi-scale-labels">
            <span>-1.0 · Water / non-vegetation</span>
            <span>0.0 · Bare surface</span>
            <span>1.0 · Dense vegetation</span>
          </div>
        </div>

        <div className="ndvi-explanation">
          <Info size={17} />
          <p>
            NDVI is calculated using near-infrared and red reflectance.
            It helps indicate vegetation greenness, but does not directly
            prove crop damage or plant health.
          </p>
        </div>
      </div>

      {/* HEALTH HISTORY */}
      <div className="panel health-history-panel">
        <div className="panel-heading">
          <div>
            <h3>Vegetation trend</h3>
            <p>Historical satellite observations</p>
          </div>

          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            <option>7 days</option>
            <option>30 days</option>
            <option>90 days</option>
          </select>
        </div>

        {healthHistory.length > 0 ? (
          <div className="health-chart">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={healthHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="ndvi"
                  stroke="#269b65"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="NDVI"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="satellite-health-placeholder">
            <Activity size={35} />
            <h3>No vegetation observations available</h3>
            <p>
              Satellite history will appear here after real NDVI
              observations are retrieved and stored.
            </p>
          </div>
        )}
      </div>

      {/* CROP STRESS */}
      <div className="panel crop-stress-panel">
        <div className="panel-heading">
          <div>
            <h3>Crop stress indicators</h3>
            <p>Environmental and vegetation monitoring</p>
          </div>
          <AlertTriangle color="#d28a35" />
        </div>

        <div className="stress-row">
          <div>
            <Droplets size={19} />
            <span>Water stress</span>
          </div>
          <strong className="stress-neutral">Not assessed</strong>
        </div>

        <div className="stress-row">
          <div>
            <Sun size={19} />
            <span>Heat stress</span>
          </div>
          <strong className="stress-neutral">Not assessed</strong>
        </div>

        <div className="stress-row">
          <div>
            <Leaf size={19} />
            <span>Vegetation change</span>
          </div>
          <strong className="stress-neutral">Not assessed</strong>
        </div>

        <p className="chart-disclaimer">
          Stress classifications will be displayed when verified
          environmental and satellite observations are available.
        </p>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="panel recommendations-panel">
        <div className="panel-heading">
          <div>
            <h3>Recommended actions</h3>
            <p>General crop monitoring suggestions</p>
          </div>
          <Sprout color="#269b65" />
        </div>

        <div className="recommendation-list">
          {recommendations.map((item, index) => {
            const Icon = item.icon;

            return (
              <div className="recommendation-item" key={index}>
                <div className="recommendation-icon">
                  <Icon size={20} />
                </div>

                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="intelligence-footer">
        CropGuard AI · Crop intelligence engine
        <span>Real satellite analysis pending integration</span>
      </footer>

    </div>
  );
}
