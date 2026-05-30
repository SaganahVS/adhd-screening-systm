import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import bgImage from "../assets/shapes.png";
import { useNavigate, useLocation } from "react-router-dom";

function CognitiveTasks() {

  const navigate = useNavigate();
  const location = useLocation();

  const age =
    location.state?.age ||
    localStorage.getItem("age") ||
    null;

  const [gameStarted, setGameStarted] = useState(false);

  const colorPool = [
    "red", "blue", "green", "yellow",
    "orange", "purple", "pink", "brown"
  ];

  const objectQuestions = [
    { target: "🍎", options: ["🐶", "🍎", "🍉", "🐒"] },
    { target: "🍉", options: ["🍉", "🐒", "🐱", "🍎"] },
    { target: "🐶", options: ["🍎", "🍉", "🐶", "🐒"] },
    { target: "🐒", options: ["🐒", "🐶", "🍉", "🍌"] },
    { target: "🍌", options: ["🍉", "🍌", "🐒", "🐱"] }
  ];

  const [questions] = useState(() =>
    [...colorPool].sort(() => 0.5 - Math.random()).slice(0, 5)
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [currentGame, setCurrentGame] = useState("color");
  const [showTransition, setShowTransition] = useState(false);

  const [selectedColor, setSelectedColor] = useState(null);
  const [, setIsCorrect] = useState(null);
  const [colorOptions, setColorOptions] = useState([]);

  const [reactionTimes, setReactionTimes] = useState([]);
  const [errorCount, setErrorCount] = useState(0);

  const startTimeRef = useRef(Date.now());

  // 🔥 NEW METRICS
  const [attempts, setAttempts] = useState(0);
  const [fastWrongAnswers, setFastWrongAnswers] = useState(0);
  const [delays, setDelays] = useState([]);
  const questionStartRef = useRef(Date.now());

  const speak = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.9;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  useEffect(() => {
    if (currentGame === "object" && questionIndex === 0) {
      speak("Find the apple");
    }
  }, [currentGame, questionIndex]);

  const shuffleArray = (array) => {
    return [...array].sort(() => 0.5 - Math.random());
  };

  const generateOptions = (index) => {
    if (!questions[index]) return [];

    let wrongOptions = colorPool.filter(
      (c) => c !== questions[index]
    );

    wrongOptions = shuffleArray(wrongOptions).slice(0, 3);

    return shuffleArray([
      questions[index],
      ...wrongOptions
    ]);
  };

  // 🚀 BACKEND INTEGRATION
  const finishGame = async () => {

  const userId = localStorage.getItem("userId");

  const totalTime = reactionTimes.reduce((a, b) => a + b, 0);

  const avgResponseTime =
    reactionTimes.length > 0
      ? totalTime / reactionTimes.length
      : 0;

  const accuracy =
    attempts > 0
      ? ((attempts - errorCount) / attempts) * 100
      : 0;

  const avgDelay =
    delays.length > 0
      ? delays.reduce((a, b) => a + b, 0) / delays.length
      : 0;

  // ✅ SAVE game score AFTER calculation
  localStorage.setItem("gameScore", accuracy);

  try {
    const res = await fetch("http://localhost:5000/api/game/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        ageGroup: "3-8",
        gameType: "game1",
        totalAttempts: attempts,
        wrongAnswers: errorCount,
        avgResponseTime,
        fastWrongAnswers,
        accuracy,
        avgDelay,
        taskCompletionRate: 100
      }),
    });

    const data = await res.json();
    console.log("Game saved:", data);

  } catch (error) {
    console.error("Error saving game:", error);
  }

  // ✅ NAVIGATION (FINAL STEP)
  navigate("/questionnaire", {
    state: {
      reactionTimes,
      errorCount,
      age
    }
  });
};

  const handleClick = (color) => {

    const now = Date.now();
    const responseTime = now - startTimeRef.current;

    setAttempts(prev => prev + 1);
    setDelays(prev => [...prev, now - questionStartRef.current]);

    setSelectedColor(color);

    if (color === questions[questionIndex]) {

      setReactionTimes(prev => [...prev, responseTime]);

      setIsCorrect(true);
      speak("Correct! You did it!");

      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {

        setSelectedColor(null);
        setIsCorrect(null);

        if (questionIndex < questions.length - 1) {

          setQuestionIndex(prev => {
            const nextIndex = prev + 1;

            setColorOptions(generateOptions(nextIndex));

            if (questions[nextIndex]) {
              speak(`Find the ${questions[nextIndex]} color`);
            }

            return nextIndex;
          });

          setTimeout(() => {
            startTimeRef.current = Date.now();
            questionStartRef.current = Date.now();
          }, 100);

        } else {

          setShowTransition(true);
          speak("Great job! Now we will find the objects.");

          setTimeout(() => {

            setShowTransition(false);
            setCurrentGame("object");
            setQuestionIndex(0);

            startTimeRef.current = Date.now();
            questionStartRef.current = Date.now();

            if (objectQuestions[0]) {
              speak(`Find the ${objectQuestions[0].target}`);
            }

          }, 5000);
        }

      }, 1500);

    } else {

      setIsCorrect(false);
      setErrorCount(prev => prev + 1);

      if (responseTime < 1000) {
        setFastWrongAnswers(prev => prev + 1);
      }

      speak("Oops! Try again.");

      setTimeout(() => {
        setSelectedColor(null);
        setIsCorrect(null);
      }, 1200);
    }
  };

  const handleObjectClick = (item) => {

    const now = Date.now();
    const responseTime = now - startTimeRef.current;

    setAttempts(prev => prev + 1);
    setDelays(prev => [...prev, now - questionStartRef.current]);

    setSelectedColor(item);

    if (item === objectQuestions[questionIndex]?.target) {

      setReactionTimes(prev => [...prev, responseTime]);

      setIsCorrect(true);
      speak("Correct! Well done!");

      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {

        setSelectedColor(null);
        setIsCorrect(null);

        if (questionIndex < objectQuestions.length - 1) {

          setQuestionIndex(prev => {
            const nextIndex = prev + 1;

            if (objectQuestions[nextIndex]) {
              speak(`Find the ${objectQuestions[nextIndex].target}`);
            }

            return nextIndex;
          });

          setTimeout(() => {
            startTimeRef.current = Date.now();
            questionStartRef.current = Date.now();
          }, 100);

        } else {

          setGameFinished(true);

          setTimeout(() => {
            finishGame();
          }, 2000);
        }

      }, 1500);

    } else {

      setIsCorrect(false);
      setErrorCount(prev => prev + 1);

      if (responseTime < 1000) {
        setFastWrongAnswers(prev => prev + 1);
      }

      speak("Oops! Try again.");

      setTimeout(() => {
        setSelectedColor(null);
        setIsCorrect(null);
      }, 1200);
    }
  };

  return (
    <div style={{
      position: "relative",
      height: "100vh",
      width: "100%",
      overflow: "hidden"
    }}>

      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(8px)",
        zIndex: -1
      }} />

      <div style={{
        position: "relative",
        zIndex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center"
      }}>

        {!gameStarted ? (
          <>
            <h1 style={{ fontSize: "48px" }}>🎮 Focus Game</h1>
            <h2>Let’s play a fun color game!</h2>

            <button
              onClick={() => {
                setGameStarted(true);
                startTimeRef.current = Date.now();
                questionStartRef.current = Date.now();
                setColorOptions(generateOptions(0));
                speak(`Find the ${questions[0]} color`);
              }}
              style={{
                padding: "20px 40px",
                fontSize: "22px",
                backgroundColor: "#e61a51d6",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer"
              }}
            >
              Start Game
            </button>
          </>
        ) : (
          <>
            {!gameFinished ? (
              showTransition ? (
                <>
                  <h1 style={{ fontSize: "56px", color: "#155aba" }}>
                    🎉 Great Job!!
                  </h1>
                  <h2 style={{ fontSize: "36px", color: "#155aba" }}>
                    Now, we will find the objects 🧸
                  </h2>
                </>
              ) : currentGame === "color" ? (
                <>
                  <h1 style={{ fontSize: "40px" }}>🎨 Find the Color</h1>
                  <h1>Find the {questions[questionIndex]} color</h1>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 140px)",
                    gap: "20px",
                    marginTop: "30px"
                  }}>
                    {colorOptions.map((color) => (
                      <div
                        key={color}
                        onClick={() => handleClick(color)}
                        style={{
                          width: "140px",
                          height: "140px",
                          backgroundColor: color,
                          borderRadius: "20px",
                          cursor: "pointer",
                          border: selectedColor === color ? "5px solid white" : "none"
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h1 style={{ fontSize: "40px" }}>Find the Correct Object Kids!!!</h1>
                  <h1>Find the {objectQuestions[questionIndex].target}</h1>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 140px)",
                    gap: "20px",
                    marginTop: "30px"
                  }}>
                    {objectQuestions[questionIndex].options.map((item) => (
                      <div
                        key={item}
                        onClick={() => handleObjectClick(item)}
                        style={{
                          width: "140px",
                          height: "140px",
                          fontSize: "60px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "white",
                          borderRadius: "20px",
                          cursor: "pointer",
                          border: selectedColor === item ? "4px solid #155aba" : "none"
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </>
              )
            ) : (
              <h1>🎉 Great Job!</h1>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default CognitiveTasks;