
const express = require("express");
const axios = require("axios");

const router = express.Router();

const TOKEN_URL =
  "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";

const PROCESS_URL =
  "https://sh.dataspace.copernicus.eu/process/v1";

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CDSE_CLIENT_ID,
    client_secret: process.env.CDSE_CLIENT_SECRET,
  });

  const response = await axios.post(TOKEN_URL, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  cachedToken = response.data.access_token;

  // Refresh one minute before expiry.
  tokenExpiresAt =
    Date.now() + (response.data.expires_in - 60) * 1000;

  return cachedToken;
}

function getBoundingBox(points) {
  if (!Array.isArray(points) || points.length < 3) {
    throw new Error("At least 3 farm boundary points are required.");
  }

  const coordinates = points.map((point) => {
    const lat = Number(point.lat);
    const lng = Number(point.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      throw new Error("Invalid farm boundary coordinates.");
    }

    return { lat, lng };
  });

  const lats = coordinates.map((p) => p.lat);
  const lngs = coordinates.map((p) => p.lng);

  const bbox = [
    Math.min(...lngs),
    Math.min(...lats),
    Math.max(...lngs),
    Math.max(...lats),
  ];

  if (bbox[0] === bbox[2] || bbox[1] === bbox[3]) {
    throw new Error("Farm boundary has no usable area.");
  }

  return bbox;
}

const trueColorEvalscript = `
//VERSION=3
function setup() {
  return {
    input: [{
      bands: ["B02", "B03", "B04", "SCL", "dataMask"]
    }],
    output: {
      bands: 3,
      sampleType: "AUTO"
    }
  };
}

function evaluatePixel(sample) {
  // Mask no-data and common cloud/shadow classes.
  const cloudy = [3, 8, 9, 10, 11].includes(sample.SCL);

  if (sample.dataMask === 0 || cloudy) {
    return [0, 0, 0];
  }

  return [
    2.5 * sample.B04,
    2.5 * sample.B03,
    2.5 * sample.B02
  ];
}
`;

router.post("/image", async (req, res) => {
  try {
    const { boundaryPoints, from, to } = req.body;

    if (!process.env.CDSE_CLIENT_ID ||
        !process.env.CDSE_CLIENT_SECRET) {
      return res.status(500).json({
        message: "Sentinel Hub credentials are not configured.",
      });
    }

    const bbox = getBoundingBox(boundaryPoints);

    if (!from || !to || new Date(from) > new Date(to)) {
      return res.status(400).json({
        message: "Provide a valid date range.",
      });
    }

    const token = await getAccessToken();

    const requestBody = {
      input: {
        bounds: {
          bbox,
          properties: {
            crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
          },
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: {
              timeRange: {
                from: `${from}T00:00:00Z`,
                to: `${to}T23:59:59Z`,
              },
              mosaickingOrder: "leastCC",
            },
          },
        ],
      },
      output: {
        width: 512,
        height: 512,
        responses: [
          {
            identifier: "default",
            format: {
              type: "image/jpeg",
            },
          },
        ],
      },
      evalscript: trueColorEvalscript,
    };

    const satelliteResponse = await axios.post(
      PROCESS_URL,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
        timeout: 60000,
      }
    );

    res.set("Content-Type", "image/jpeg");
    res.set("Cache-Control", "no-store");
    return res.send(Buffer.from(satelliteResponse.data));
  } catch (error) {
    const status = error.response?.status || 500;

    let details = error.response?.data;
    if (Buffer.isBuffer(details)) {
      details = details.toString("utf8");
    }

    console.error("Satellite API error:", details || error.message);

    return res.status(status).json({
      message: "Could not retrieve satellite imagery.",
      details:
        typeof details === "string"
          ? details.slice(0, 1000)
          : error.message,
    });
  }
});

module.exports = router;
