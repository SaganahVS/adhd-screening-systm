const express = require("express");
const router = express.Router();
const { saveWebcamData } = require("../controllers/webcamController");

router.post("/", saveWebcamData);

module.exports = router;