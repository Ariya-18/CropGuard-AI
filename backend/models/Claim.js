const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
  farmerName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  crop: {
    type: String,
    required: true
  },
  disaster: {
    type: String,
    required: true
  },
  farmArea: {
    type: Number,
    required: true
  },
  damagePercentage: {
    type: Number,
    required: true
  },
  affectedArea: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Under Review", "Approved", "Rejected"],
    default: "Pending"
  },
  demo: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Claim", claimSchema);