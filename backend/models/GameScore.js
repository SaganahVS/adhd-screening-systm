const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  ageGroup: {
    type: String,
    enum: ["3-8", "9-14"],
    required: true
  },

  gameType: {
    type: String,
    required: true // "game1", "game2", "combined"
  },

  avgResponseTime: {
    type: Number,
    default: 0
  },

  totalAttempts: {
    type: Number,
    default: 0
  },

  wrongAnswers: {
    type: Number,
    default: 0
  },

  fastWrongAnswers: {
    type: Number,
    default: 0
  },

  accuracy: {
    type: Number,
    default: 0
  },

  avgDelay: {
    type: Number,
    default: 0
  },

  taskCompletionRate: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ⚠️ Keep model name as "Game"
module.exports = mongoose.model("Game", gameSchema);