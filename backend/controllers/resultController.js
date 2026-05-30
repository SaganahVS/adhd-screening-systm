const Game = require("../models/GameScore");
const Webcam = require("../models/Webcam");
const Questionnaire = require("../models/Questionnaire");
const Result = require("../models/Result");
const User = require("../models/User");

// ✅ SAVE RESULT
exports.saveResult = async (req, res) => {
  try {
    const result = await Result.create(req.body);

    res.status(201).json({
      message: "Result saved successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// ✅ GET FINAL RESULT
exports.getFinalResult = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    // 👤 USER DATA
    const user = await User.findById(userId);
    if (!user) {
      user = await User.findOne().sort({ createdAt: -1 });
    }
    console.log("USER ID:", userId);
    console.log("USER DATA:", user); 
    // 🎮 GAME
    const gameData = await Game.findOne({
      userId,
      gameType: "combined",
    }).sort({ createdAt: -1 });

    // 🎥 WEBCAM
    const webcamData = await Webcam.findOne({
      userId,
    }).sort({ createdAt: -1 });

    // 📋 QUESTIONNAIRE
    const questionnaireData = await Questionnaire.findOne({
      userId,
    }).sort({ createdAt: -1 });

    // 🧠 SAFE SCORE CALCULATION
    const gameScore =
      (gameData?.taskCompletionRate || 0) +
      (gameData?.accuracy || 0) -
      (gameData?.avgDelay || 0);

    const webcamScore = webcamData?.finalScore || 0;

    const questionnaireScore =
      questionnaireData?.questionnaireScore || 0;

    // 🧮 FINAL SCORE
    const finalScore = Math.round(
      (gameScore + webcamScore + questionnaireScore) / 3
    );

    // 🚨 RISK
    let risk = "Low Risk";

    if (finalScore < 30) risk = "High Risk";
    else if (finalScore < 60) risk = "Medium Risk";

    // ✅ RESPONSE
    res.json({
      name: user?.name || "Child",
      age: user?.age || "-",
      date: new Date(),

      finalScore,
      risk,

      breakdown: {
        gameScore,
        webcamScore,
        questionnaireScore,
      },
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};