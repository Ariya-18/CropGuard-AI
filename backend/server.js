
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const Farm = require("./models/Farm");
const Claim = require("./models/Claim");

const satelliteRoutes = require("./routes/satellite");
const gnaniRoutes = require("./routes/gnani");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CropGuard API is running"
  });
});

// Farm routes
app.get("/api/farms", async (req, res) => {
  try {
    const farms = await Farm.find().sort({ createdAt: -1 });
    res.json({ success: true, farms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/farms", async (req, res) => {
  try {
    const { farmerName, location, crop, area, boundary } = req.body;

    if (!farmerName || !location || !crop || !area) {
      return res.status(400).json({
        success: false,
        message: "All farm details are required"
      });
    }

    const farm = await Farm.create({
      farmerName,
      location,
      crop,
      area,
      boundary: boundary || []
    });

    res.status(201).json({
      success: true,
      message: "Farm registered successfully",
      farm
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alerts
app.get("/api/alerts", (req, res) => {
  res.json({
    success: true,
    alerts: [
      {
        id: 1,
        title: "Heavy rainfall watch",
        location: "Coimbatore",
        severity: "Moderate",
        date: "Demo alert"
      }
    ]
  });
});

// Create preliminary insurance claim
app.post("/api/claims", async (req, res) => {
  try {
    const {
      farmerName,
      location,
      crop,
      disaster,
      farmArea,
      damagePercentage,
      affectedArea
    } = req.body;

    if (
      !farmerName || !location || !crop || !disaster ||
      !farmArea || damagePercentage == null || affectedArea == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Required claim details are missing"
      });
    }

    const claim = await Claim.create({
      farmerName,
      location,
      crop,
      disaster,
      farmArea,
      damagePercentage,
      affectedArea,
      status: "Pending",
      demo: true
    });

    res.status(201).json({
      success: true,
      message: "Preliminary claim submitted successfully",
      claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get claims
app.get("/api/claims", async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    res.json({ success: true, claims });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update claim status
app.patch("/api/claims/:id/status", async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Under Review",
      "Approved",
      "Rejected"
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim status"
      });
    }

    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found"
      });
    }

    res.json({
      success: true,
      message: "Claim status updated",
      claim
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Existing satellite API
app.use("/api/satellite", satelliteRoutes);

// Gnani AI voice APIs
app.use("/api/gnani", gnaniRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CropGuard backend running on port ${PORT}`);
});
