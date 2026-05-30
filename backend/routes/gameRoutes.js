const express = require("express");
const router = express.Router();

const {
  saveGameData,
  saveFinalCombinedResult
} = require("../controllers/gameController");

// 🎮 Save individual game (Game 1 / Game 2)
router.post("/submit", saveGameData);

// 🧠 Combine both games → final game score
router.post("/final", saveFinalCombinedResult);

module.exports = router;