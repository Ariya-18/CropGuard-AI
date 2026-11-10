const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema({
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
  area: {
    type: Number,
    required: true
  },
  boundary: {
    type: [[Number]],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Farm", farmSchema);