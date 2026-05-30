const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  name: String,

  inattention: Number,
  hyperactivity: Number,
  impulsivity: Number,

  // questionnaire extra
  answers: Object,
  otherText: String,

  // ✅ ADD THESE (your requirement)
  webcamScore: Number,
  gameScore: Number,
  finalScore: Number,

}, { timestamps: true });

module.exports = mongoose.model("Result", ResultSchema);