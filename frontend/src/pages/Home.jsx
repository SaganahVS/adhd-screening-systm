import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/mindspark.png";
import balloon from "../assets/balloon1.png";

function Home() {
  const navigate = useNavigate();
  const [showAnimation, setShowAnimation] = useState(false);

  const handleClick = () => {
    setShowAnimation(true);
    setTimeout(() => {
      navigate("/next");
    }, 4000);
  };

  const balloons = Array.from({ length: 400 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 40 + Math.random() * 60,
    duration: 2 + Math.random() * 4,
  }));

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "100% 100%",
        overflow: "hidden",
      }}
    >
      {showAnimation &&
        balloons.map((b) => (
          <img
            key={b.id}
            src={balloon}
            alt="balloon"
            style={{
              position: "absolute",
              bottom: "-150px",
              left: `${b.left}%`,
              width: `${b.size}px`,
              animation: `floatUp ${b.duration}s ease-in forwards`,
            }}
          />
        ))}

      <button
        onClick={handleClick}
        style={{
          position: "absolute",
          bottom: "80px",
          left: "150px",
          padding: "18px 80px",
          fontSize: "22px",
          fontWeight: "bold",
          backgroundColor: "#2f5bea",
          color: "white",
          border: "none",
          borderRadius: "40px",
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
        }}
      >
        Get Started
      </button>

      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes floatUp {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-120vh); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}

export default Home;