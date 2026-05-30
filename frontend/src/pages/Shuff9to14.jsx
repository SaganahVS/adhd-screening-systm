import React, { useState, useEffect } from "react";
import gameBg from "../assets/cupbg.jpg";
import startBg from "../assets/startbg.jpg";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";

const LEVELS = [
  { cups: 3, shuffles: 4 },
  { cups: 3, shuffles: 4 },
  { cups: 4, shuffles: 5 },
  { cups: 4, shuffles: 5 },
  { cups: 5, shuffles: 6 }
];

const launchFireworks = () => {
  const duration = 4000;
  const animationEnd = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > animationEnd) {
      clearInterval(interval);
      return;
    }

    confetti({
      particleCount: 80,
      spread: 120,
      startVelocity: 45,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2
      }
    });
  }, 250);
};

function CupShuffleGame() {
  const navigate = useNavigate();

  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [cups, setCups] = useState([]);
  const [openCup, setOpenCup] = useState(null);
  const [phase, setPhase] = useState("reveal");
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState("");

  const speak = (text) => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 0.9;
      speech.pitch = 1;
      speech.onend = () => resolve();
      window.speechSynthesis.speak(speech);
    });
  };

  const revealSound = () => new Audio("/sounds/beep.mp3").play();
  const shuffleSound = () => new Audio("/sounds/shuffle.mp3").play();
  const pickSound = () => new Audio("/sounds/tap.mp3").play();

  // ✅ SAVE SHUFFLE DATA TO BACKEND
  const sendShuffleData = async () => {

  const userId = localStorage.getItem("userId");

  const totalAttempts = level;
  const wrongAnswers = attempt;

  const accuracy =
    totalAttempts > 0
      ? ((totalAttempts - wrongAnswers) / totalAttempts) * 100
      : 0;

  try {
    localStorage.setItem("gameScore", accuracy);
    await fetch("http://localhost:5000/api/game/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        ageGroup: "9-14",
        gameType: "game2",

        totalAttempts,
        wrongAnswers,
        accuracy,
        avgDelay: 0,
        fastWrongAnswers: 0,
        avgResponseTime: 0,
        taskCompletionRate: 100
      }),
    });

  } catch (error) {
    console.error(error);
  }
};

  const revealSequence = async (count) => {
    for (let i = 0; i < count; i++) {
      revealSound();
      setOpenCup(i);

      await new Promise((r) => setTimeout(r, 800));

      setOpenCup(null);

      await new Promise((r) => setTimeout(r, 300));
    }

    shuffleCups();
  };

  const shuffleCups = async () => {
    const userId = localStorage.getItem("userId");
    
    const moves = LEVELS[level - 1].shuffles;

    setPhase("shuffle");
    setMessage("Follow the shuffle");

    await speak("Follow the shuffle");

    for (let i = 0; i < moves; i++) {
      shuffleSound();

      setCups((prev) => {
        const shuffledPositions = [...prev.map((c) => c.position)].sort(
          () => Math.random() - 0.5
        );

        return prev.map((cup, index) => ({
          ...cup,
          position: shuffledPositions[index],
        }));
      });

      await new Promise((r) => setTimeout(r, 900));
    }

    setPhase("choose");
    setMessage("Pick the cup");
    speak("Pick the cup");
  };

  useEffect(() => {
    const startLevel = async () => {
      const levelData = LEVELS[level - 1];
      const arr = [];

      for (let i = 0; i < levelData.cups; i++) {
        arr.push({
          id: i,
          hasBall: false,
          position: i,
        });
      }

      const ballIndex = Math.floor(Math.random() * levelData.cups);
      arr[ballIndex].hasBall = true;

      setCups(arr);
      setOpenCup(null);
      setPhase("reveal");
      setMessage("Watch where the ball is");

      await speak("Watch where the ball is");

      revealSequence(arr.length);
    };

    if (gameStarted) {
      startLevel();
    }
  }, [level, gameStarted]);

  const completeGame = async () => {
    setMessage("🎉 Game Completed!");
    await speak("Congratulations! You completed the game");
    launchFireworks();

    setTimeout(async () => {
      await sendShuffleData();
      navigate("/questionnaire");
    }, 3000);
  };

  const handleClick = (cup) => {
    if (phase !== "choose") return;

    pickSound();
    setOpenCup(cup.position);

    if (cup.hasBall) {
      setMessage("Correct!");
      speak("Correct");

      setTimeout(() => {
        if (level < LEVELS.length) {
          setLevel((prev) => prev + 1);
          setAttempt(0);
        } else {
          completeGame();
        }
      }, 1500);
    } else {
      if (attempt === 0) {
        setAttempt(1);
        setMessage("Wrong! Watch again");
        speak("Wrong. Watch again");

        const correctCup = cups.find((c) => c.hasBall);

        setTimeout(() => {
          setOpenCup(correctCup.position);
        }, 1000);

        setTimeout(() => {
          setOpenCup(null);
          shuffleCups();
        }, 2200);
      } else {
        setMessage("Moving to next level");
        speak("Moving to next level");

        setTimeout(() => {
          if (level < LEVELS.length) {
            setLevel((prev) => prev + 1);
            setAttempt(0);
          } else {
            completeGame();
          }
        }, 1500);
      }
    }
  };

  if (!gameStarted) {
    return (
      <div
        style={{
          height: "100vh",
          backgroundImage: `url(${startBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ color: "white", marginBottom: "20px" }}>
          🎯 Cup Shuffle Game
        </h1>

        <div
          style={{
            background: "rgba(182,86,148,0.85)",
            padding: "30px 40px",
            borderRadius: "14px",
            maxWidth: "420px",
            textAlign: "center",
            backdropFilter: "blur(10px)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
          }}
        >
          <h3 style={{ color: "white" }}>How to Play</h3>

          <p style={{ color: "white" }}>
            1️⃣ Watch where the ball is hidden
            <br />
            <br />
            2️⃣ Follow the shuffle and pick the correct cup
          </p>

          <button
            onClick={() => setGameStarted(true)}
            style={{
              marginTop: "15px",
              padding: "14px 40px",
              fontSize: "18px",
              borderRadius: "12px",
              border: "none",
              color: "white",
              cursor: "pointer",
              background: "#371653",
            }}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        backgroundImage: `url(${gameBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>🎯 Cup Shuffle Game</h1>
      <h2>
        Level {level} / {LEVELS.length}
      </h2>
      <h3>{message}</h3>

      <div
        style={{
          position: "relative",
          width: "700px",
          height: "200px",
          marginTop: "60px",
        }}
      >
        {cups.map((cup) => {
          const left = cup.position * 150 + 80;

          return (
            <div
              key={cup.id}
              onClick={() => handleClick(cup)}
              style={{
                position: "absolute",
                left,
                top: "40px",
                transition: "left 0.7s",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              {cup.hasBall && (
                <div
                  style={{
                    position: "absolute",
                    top: "75px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "40px",
                    opacity: openCup === cup.position ? 1 : 0,
                  }}
                >
                  ⚽
                </div>
              )}

              <div
                style={{
                  width: "70px",
                  height: "12px",
                  background: "rgba(0,0,0,0.35)",
                  borderRadius: "50%",
                  margin: "0 auto",
                  transform: "translateY(80px)",
                }}
              />

              <div
                style={{
                  fontSize: "110px",
                  transform:
                    openCup === cup.position
                      ? "translateY(-90px)"
                      : "translateY(0)",
                  transition: "transform 0.35s",
                }}
              >
                🥤
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CupShuffleGame;