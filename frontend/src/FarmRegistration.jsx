
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  ArrowLeft,
  MapPin,
  Save,
  Trash2,
  Search,
  LocateFixed,
  Undo2,
  Maximize,
  Loader2,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

const API = "http://localhost:5000/api";

const defaultCenter = [11.0168, 76.9558];

const locationIcon = new L.DivIcon({
  className: "farm-location-marker",
  html: '<div class="farm-marker-dot"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function MapController({ center, points, fitRequest }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (center) {
      map.flyTo(center, 17, { duration: 1.2 });
    }
  }, [center, map]);

  useEffect(() => {
    if (fitRequest > 0 && points.length >= 3) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 18 });
    }
  }, [fitRequest, points, map]);

  return null;
}

function BoundaryDrawer({ points, setPoints }) {
  useMapEvents({
    click(event) {
      setPoints((previous) => [
        ...previous,
        [event.latlng.lat, event.latlng.lng],
      ]);
    },
  });

  return (
    <>
      {points.length >= 3 && (
        <Polygon
          positions={points}
          pathOptions={{
            color: "#15945d",
            fillColor: "#38c98a",
            fillOpacity: 0.3,
            weight: 3,
          }}
        />
      )}

      {points.map((point, index) => (
        <Marker
          key={`${point[0]}-${point[1]}-${index}`}
          position={point}
        />
      ))}
    </>
  );
}

export default function FarmRegistration({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    farmerName: "",
    location: "",
    crop: "Banana",
    area: "",
  });

  const [points, setPoints] = useState([]);
  const [center, setCenter] = useState(defaultCenter);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fitRequest, setFitRequest] = useState(0);

  const searchTimer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(searchTimer.current);
  }, []);

  const updateField = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  // Search an address using OpenStreetMap Nominatim
  const searchAddress = async (event) => {
    event?.preventDefault();

    const query = searchText.trim();

    if (!query) {
      setMessage("Please enter an address to search.");
      return;
    }

    try {
      setSearching(true);
      setMessage("");
      setSearchResults([]);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Address search service unavailable.");
      }

      const results = await response.json();

      if (!results.length) {
        setMessage("No matching address found. Try a nearby village or landmark.");
        return;
      }

      setSearchResults(results);
    } catch (error) {
      setMessage(error.message || "Unable to search this address.");
    } finally {
      setSearching(false);
    }
  };

  const selectAddress = (result) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    const position = [latitude, longitude];

    setCenter(position);
    setSearchText(result.display_name);
    setSearchResults([]);

    setForm((previous) => ({
      ...previous,
      location: result.display_name,
    }));

    setMessage("Location found. Now mark your farm boundary on the map.");
  };

  // Get the farmer's current GPS position
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by this browser.");
      return;
    }

    setLocating(true);
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const coordinates = [latitude, longitude];

        setCenter(coordinates);
        setCurrentPosition(coordinates);
        setLocating(false);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          if (response.ok) {
            const result = await response.json();

            setForm((previous) => ({
              ...previous,
              location:
                result.display_name ||
                `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            }));
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setForm((previous) => ({
            ...previous,
            location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          }));
        }

        setMessage("Your current location has been found.");
      },
      (error) => {
        setLocating(false);

        if (error.code === 1) {
          setMessage("Location permission denied. Allow location access in your browser.");
        } else if (error.code === 2) {
          setMessage("Your current location could not be determined.");
        } else {
          setMessage("Location request timed out. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const undoPoint = () => {
    setPoints((previous) => previous.slice(0, -1));
  };

  const clearPoints = () => {
    setPoints([]);
    setMessage("Boundary points cleared.");
  };

  const fitBoundary = () => {
    if (points.length < 3) {
      setMessage("Select at least 3 points before fitting the boundary.");
      return;
    }

    setFitRequest((previous) => previous + 1);
  };

  const saveFarm = async (event) => {
    event.preventDefault();
    setMessage("");

    if (points.length < 3) {
      setMessage("Please mark at least 3 boundary points on the map.");
      return;
    }

    if (!form.location.trim()) {
      setMessage("Please enter or select your farm location.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API}/farms`, {
        ...form,
        area: Number(form.area),
        boundary: points,
      });

      setMessage(response.data.message || "Farm registered successfully.");
      onSuccess?.(response.data.farm);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to register farm. Check your backend and MongoDB."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <button
        type="button"
        className="back-button"
        onClick={onBack}
      >
        <ArrowLeft size={17} /> Back to overview
      </button>

      <div className="registration-heading">
        <div>
          <p className="eyebrow">FARM MANAGEMENT</p>
          <h2>Register your farm</h2>
          <p className="muted">
            Enter your details, find your location and mark your farmland.
          </p>
        </div>

        <div className="registration-icon">
          <MapPin size={25} />
        </div>
      </div>

      <form onSubmit={saveFarm}>
        <div className="panel registration-panel">
          <h3>Farm information</h3>
          <p className="form-subtitle">
            Enter the farmer and crop details.
          </p>

          <div className="form-grid">
            <label>
              Farmer name
              <input
                name="farmerName"
                value={form.farmerName}
                onChange={updateField}
                placeholder="Enter farmer name"
                required
              />
            </label>

            <label>
              Farm location
              <input
                name="location"
                value={form.location}
                onChange={updateField}
                placeholder="Search and select your farm location"
                required
              />
            </label>

            <label>
              Crop type
              <select
                name="crop"
                value={form.crop}
                onChange={updateField}
              >
                <option>Banana</option>
                <option>Paddy</option>
                <option>Sugarcane</option>
                <option>Coconut</option>
                <option>Groundnut</option>
                <option>Maize</option>
                <option>Turmeric</option>
                <option>Cotton</option>
                <option>Vegetables</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Farm area (acres)
              <input
                type="number"
                name="area"
                min="0.1"
                step="0.1"
                value={form.area}
                onChange={updateField}
                placeholder="e.g. 2.5"
                required
              />
            </label>
          </div>
        </div>

        <div className="panel registration-panel map-registration">
          <div className="panel-heading">
            <div>
              <h3>Find your farm location</h3>
              <p>
                Search your address or use GPS to move the map to your land.
              </p>
            </div>

            <span className="live-tag">INTERACTIVE MAP</span>
          </div>

          <div className="farm-map-search">
            <div className="farm-search-input">
              <Search size={18} />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search village, town, address or landmark..."
              />

              <button
                type="button"
                onClick={searchAddress}
                disabled={searching}
              >
                {searching ? <Loader2 className="spin" size={17} /> : "Search"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="farm-search-results">
                {searchResults.map((result) => (
                  <button
                    type="button"
                    key={result.place_id}
                    onClick={() => selectAddress(result)}
                  >
                    <MapPin size={17} />
                    <span>{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="farm-map-toolbar">
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="gps-button"
            >
              {locating ? (
                <Loader2 size={17} className="spin" />
              ) : (
                <LocateFixed size={17} />
              )}
              {locating ? "Finding location..." : "Use my current location"}
            </button>

            <div className="farm-map-tools">
              <button type="button" onClick={undoPoint} disabled={!points.length}>
                <Undo2 size={16} /> Undo
              </button>

              <button
                type="button"
                onClick={fitBoundary}
                disabled={points.length < 3}
              >
                <Maximize size={16} /> Fit boundary
              </button>

              <button
                type="button"
                onClick={clearPoints}
                disabled={!points.length}
              >
                <Trash2 size={16} /> Clear
              </button>
            </div>
          </div>

          <div className="farm-map-wrapper">
            <MapContainer
              center={defaultCenter}
              zoom={15}
              minZoom={3}
              maxZoom={20}
              scrollWheelZoom={true}
              doubleClickZoom={true}
              touchZoom={true}
              zoomControl={true}
              dragging={true}
              className="drawing-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              <MapController
                center={center}
                points={points}
                fitRequest={fitRequest}
              />

              <BoundaryDrawer
                points={points}
                setPoints={setPoints}
              />

              {currentPosition && (
                <Marker
                  position={currentPosition}
                  icon={locationIcon}
                />
              )}
            </MapContainer>
          </div>

          <div className="farm-map-summary">
            <div>
              <strong>{points.length}</strong>
              <span>Boundary points selected</span>
            </div>

            <span className={points.length >= 3 ? "boundary-ready" : "boundary-pending"}>
              {points.length >= 3 ? "Boundary ready" : "Need at least 3 points"}
            </span>
          </div>

          <p className="map-instruction">
            After finding your location, click around the outer edges of your
            farmland in sequence. The last point will connect to the first to
            create your farm boundary. Zoom in for better accuracy.
          </p>
        </div>

        {message && (
          <div className="form-message" role="status">
            {message}
          </div>
        )}

        <button
          className="save-farm-button"
          type="submit"
          disabled={loading}
        >
          <Save size={17} />
          {loading ? "Saving farm..." : "Register farm"}
        </button>
      </form>
    </div>
  );
}
