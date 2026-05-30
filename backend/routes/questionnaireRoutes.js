const express = require("express");
const router = express.Router();

const {
  processQuestionnaire
} = require("../controllers/questionnaireController");

// POST API
router.post("/", processQuestionnaire);

module.exports = router;