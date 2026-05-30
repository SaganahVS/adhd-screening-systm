const mongoose = require("mongoose");

const webcamSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },

  ageGroup: {
    type: String,
    default: "3-8"
  },

  attentionScore: {
    type: Number,
    default: 0
  },

  gazeScore: {
    type: Number,
    default: 0
  },

  accuracyScore: {
    type: Number,
    default: 0
  },

  inattentionScore: {
    type: Number,
    default: 0
  },

  blinkCount: {
    type: Number,
    default: 0
  },

  saccadeCount: {
    type: Number,
    default: 0
  },

  fixationTime: {
    type: Number,
    default: 0
  },

  finalScore: {
    type: Number,
    default: 0
  },

  risk: {
    type: String,
    default: "Low Risk"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Webcam", webcamSchema);