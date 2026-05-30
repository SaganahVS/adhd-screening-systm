const Game = require("../models/GameScore");

// ✅ 1. SAVE INDIVIDUAL GAME DATA (Game 1 / Game 2)
exports.saveGameData = async (req, res) => {
  try {
    const { userId, ageGroup, gameType } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const data = req.body;

    // 💾 Save raw game data
    const game = await Game.create(data);

    // 🧠 ADHD-based scoring (PER GAME)
    const attentionScore =
      (data.taskCompletionRate || 0) +
      (data.accuracy || 0) -
      (data.avgDelay || 0);

    const impulsivityScore =
      (data.fastWrongAnswers || 0) +
      (data.avgResponseTime || 0) +
      (data.totalAttempts || 0);

    res.json({
      message: "Game data saved successfully",
      gameId: game._id,
      scores: {
        attentionScore,
        impulsivityScore
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ✅ 2. COMBINE TWO GAMES → FINAL GAME SCORE
exports.saveFinalCombinedResult = async (req, res) => {
  try {
    const { userId, ageGroup } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    // 🔥 Fetch BOTH games (dynamic for both age groups)
    const games = await Game.find({ userId, ageGroup });

    if (games.length < 2) {
      return res.status(400).json({
        message: "At least 2 games required to calculate final score"
      });
    }

    let totalAttempts = 0;
    let totalWrong = 0;
    let totalResponse = 0;
    let totalFastWrong = 0;
    let totalDelay = 0;
    let totalAccuracy = 0;
    let totalTasks = 0;

    games.forEach(g => {
      totalAttempts += g.totalAttempts || 0;
      totalWrong += g.wrongAnswers || 0;
      totalResponse += g.avgResponseTime || 0;
      totalFastWrong += g.fastWrongAnswers || 0;
      totalDelay += g.avgDelay || 0;
      totalAccuracy += g.accuracy || 0;
      totalTasks += g.taskCompletionRate || 0;
    });

    const count = games.length;

    // 🎯 FINAL COMBINED GAME DATA
    const finalData = {
      userId,
      ageGroup,
      gameType: "combined",

      avgResponseTime: totalResponse / count,
      totalAttempts,
      wrongAnswers: totalWrong,
      fastWrongAnswers: totalFastWrong,
      accuracy: totalAccuracy / count,
      avgDelay: totalDelay / count,
      taskCompletionRate: totalTasks / count
    };

    // 🧠 FINAL SCORES (GAME LEVEL)
    const attentionScore =
      finalData.taskCompletionRate +
      finalData.accuracy -
      finalData.avgDelay;

    const impulsivityScore =
      finalData.fastWrongAnswers +
      finalData.avgResponseTime +
      finalData.totalAttempts;

    // 💾 Save combined result
    const finalGame = await Game.create(finalData);

    res.json({
      message: "Final combined game score calculated",
      finalGameId: finalGame._id,

      gameScores: {
        attentionScore,
        impulsivityScore
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};