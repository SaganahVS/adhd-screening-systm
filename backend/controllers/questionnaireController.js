const Questionnaire = require("../models/Questionnaire");

exports.processQuestionnaire = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const {
      userId,
      answers,
      inattention,
      hyperactivity,
      impulsivity,
      otherText
    } = req.body;

    // ✅ validation
    if (!userId || !answers) {
      return res.status(400).json({
        message: "userId and answers are required"
      });
    }

    // ✅ total score
    const questionnaireScore =
      (inattention || 0) +
      (hyperactivity || 0) +
      (impulsivity || 0);

    const savedData = await Questionnaire.create({
      userId,
      answers,
      inattention,
      hyperactivity,
      impulsivity,
      questionnaireScore,
      otherText
    });

    res.status(200).json({
      success: true,
      data: savedData
    });

  } catch (error) {
    console.error("ERROR:", error);

    res.status(500).json({
      message: "Error processing questionnaire"
    });
  }
};