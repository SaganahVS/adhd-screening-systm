const express = require("express");
const router = express.Router();

const {
  saveResult,
  getFinalResult,
} = require("../controllers/resultController");

router.post("/", saveResult);
router.get("/:userId", getFinalResult);

module.exports = router;