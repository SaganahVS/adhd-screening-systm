import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bgImage from "../assets/background.png";

export default function InstructionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [age, setAge] = useState(null);
  const [error, setError] = useState("");

  //direct URL access
  useEffect(() => {
    const receivedAge = Number(location.state?.age);

    if (!receivedAge || isNaN(receivedAge)) {
      navigate("/next");
    } else {
      setAge(receivedAge);
    }
  }, [location.state, navigate]);

  const isValidAge = age >= 3 && age <= 14;

  const handleStart = () => {
    if (!isValidAge) {
      setError("Age must be between 3 and 14.");
      return;
    }

    if (age >= 3 && age <= 8) {
      navigate("/age3to8");
    } else if (age >= 9 && age <= 14) {
      navigate("/age9to14");
    }
  };

  return (
    <>
      <style>{`
        .container {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: 'Segoe UI', sans-serif;
        }

        .background {
          position: absolute;
          inset: 0;
          background-image: url(${bgImage});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(10px);
          z-index: -1;
        }

        .card {
          width: 75%;
          max-width: 750px;
          background: rgba(255,255,255,0.96);
          padding: 30px 40px;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
        }

        .title {
          text-align: center;
          margin-bottom: 5px;
        }

        .subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 15px;
        }

        .alert-box {
          background: #eaf4ff;
          padding: 10px;
          border-radius: 12px;
          margin-bottom: 10px;
          color: #444;
          font-size: 17px;
          text-align: center;
        }

        .error-text {
          color: red;
          text-align: center;
          margin-top: 10px;
          font-size: 14px;
        }

        .section-title {
          text-align: center;
          margin-top: 20px;
          font-size: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }

        .info-card {
          display: flex;
          align-items: center;
          background: #f4f8ff;
          padding: 10px;
          border-radius: 15px;
        }

        .icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 18px;
          margin-right: 10px;
        }

        .blue { background: #4aa3df; }
        .yellow { background: #f2b705; }
        .purple { background: #9c6ade; }
        .green { background: #4caf50; }

        .info-card h4 {
          margin: 0;
          font-size: 15px;
        }

        .info-card p {
          margin: 0;
          font-size: 13px;
          color: #555;
        }

        .tips-box {
          background: #e6f0fa;
          padding: 15px;
          border-radius: 15px;
          margin-top: 20px;
          font-size: 14px;
        }

        .tips-box h3 {
          text-align: center;
          margin-bottom: 8px;
        }

        .tips-box ul {
          list-style-position: inside;
          text-align: left;
          font-size: 15px;
          line-height: 1.7;
          max-width: 280px;
          margin: 0 auto;
          margin-bottom: 16px;
        }

        .button-group {
          display: flex;
          justify-content: space-between;
          margin-top: 25px;
        }

        .back-btn {
          padding: 8px 18px;
          border-radius: 25px;
          border: 1px solid #ccc;
          background: white;
          cursor: pointer;
          font-size: 14px;
        }

        .next-btn {
          padding: 10px 22px;
          border-radius: 25px;
          border: none;
          background: linear-gradient(to right, #7c4dff, #40c9a2);
          color: white;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
          transition: 0.3s ease;
        }

        .next-btn:hover {
          opacity: 0.9;
        }

        .next-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="container">
        <div className="background"></div>

        <div className="card">
          <h1 className="title">Dear Parent 👨‍👩‍👧‍👦</h1>
          <p className="subtitle">
            Instructions for your child’s screening
          </p>

          <div className="alert-box">
            ⚠️ This screening is <strong>not a diagnosis.</strong> It helps
            identify early signs. Please stay with your child during the session.
          </div>

          <h2 className="section-title">What’s Coming Up:</h2>

          <div className="grid">
            <div className="info-card">
              <div className="icon blue">👁️</div>
              <div>
                <h4>Observation Time</h4>
                <p>We’ll observe your child’s behavior.</p>
              </div>
            </div>

            <div className="info-card">
              <div className="icon yellow">🎮</div>
              <div>
                <h4>Fun Games</h4>
                <p>Quick games that test focus and memory.</p>
              </div>
            </div>

            <div className="info-card">
              <div className="icon purple">📋</div>
              <div>
                <h4>Questionnaire</h4>
                <p>Answer simple questions about daily behavior.</p>
              </div>
            </div>

            <div className="info-card">
              <div className="icon green">⭐</div>
              <div>
                <h4>Results</h4>
                <p>Get a screening summary with recommendations.</p>
              </div>
            </div>
          </div>

          <div className="tips-box">
            <h3>📌 Tips for a Smooth Session</h3>
            <ul>
              <li>Find a quiet, comfortable spot</li>
              <li>Ensure good lighting</li>
              <li>Keep it relaxed and fun</li>
              <li>Session takes 15–20 minutes</li>
            </ul>
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="button-group">
            <button
              className="back-btn"
              onClick={() => navigate("/next")}
            >
              ← Back
            </button>

            <button
              className="next-btn"
              onClick={handleStart}
              disabled={!isValidAge}
            >
              I’m Ready! Let’s Go ✨
            </button>
          </div>
        </div>
      </div>
    </>
  );
}