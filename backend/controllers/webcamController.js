const Webcam = require("../models/Webcam");

exports.saveWebcamData = async (req, res) => {
  try {
    const {
      userId,
      ageGroup,
      attentionScore,
      gazeScore,
      accuracyScore,
      inattentionScore,
      blinkCount,
      saccadeCount,
      fixationTime
    } = req.body;

    // 🔥 Calculate final score (you can tune this)
    const finalScore =
      attentionScore +
      gazeScore +
      accuracyScore -
      inattentionScore;

    // 🔥 Simple risk logic
    let risk = "Low Risk";
    if (finalScore < 30) risk = "High Risk";
    else if (finalScore < 60) risk = "Medium Risk";

    const data = await Webcam.create({
      userId,
      ageGroup,
      attentionScore,
      gazeScore,
      accuracyScore,
      inattentionScore,
      blinkCount,
      saccadeCount,
      fixationTime,
      finalScore,
      risk
    });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};