const mongoose = require("mongoose");

const questionnaireSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  inattention: Number,
  hyperactivity: Number,
  impulsivity: Number,

  questionnaireScore: Number,

  answers: {
    type: Object,
    required: true
  },

  otherText: String

}, { timestamps: true });

module.exports = mongoose.model("Questionnaire", questionnaireSchema);