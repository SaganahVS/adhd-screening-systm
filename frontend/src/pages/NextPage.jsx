import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/mindspark.png";

function NextPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  const trimmedName = name.trim();
  const nameRegex = /^[A-Za-z. ]+$/;
  const numericAge = Number(age);

  // ✅ Name validation
  if (trimmedName === "") {
    setMessage("Please enter the name");
    return;
  }

  if (!nameRegex.test(trimmedName)) {
    setMessage("Enter valid name");
    return;
  }

  // ✅ Age validation
  if (age.trim() === "") {
    setMessage("Please enter age");
    return;
  }

  if (isNaN(numericAge)) {
    setMessage("Enter valid age");
    return;
  }

  if (numericAge < 3) {
    setMessage("Age must be 3 or above");
    return;
  }

  if (numericAge > 14) {
    setMessage("Only age between 3 and 14 allowed");
    return;
  }

  setMessage("");

  try {
    const res = await fetch("http://localhost:5000/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: trimmedName,
        age: numericAge,
      }),
    });

    const data = await res.json();

    console.log("Response:", data);

   if (!res.ok) {
  console.log("Backend error:", data);
  setMessage(data.message || data.error || JSON.stringify(data));
  return;
}
    const userId = data.userId;

    localStorage.setItem("userId", userId);
    localStorage.setItem("childName", trimmedName);
    localStorage.setItem("childAge", numericAge);
    navigate("/instructions", {
      state: {
        userId,
        name: trimmedName,
        age: numericAge,
      },
    });
  } catch (error) {
    console.error("Frontend error:", error);
    setMessage("Server error");
  }
};
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backdropFilter: "blur(8px)",
          background: "rgba(0,0,0,0.3)",
        }}
      ></div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "420px",
          padding: "50px 40px",
          borderRadius: "20px",
          background:
            "linear-gradient(135deg, rgba(255,182,193,0.9), rgba(173,216,230,0.9), rgba(255,255,153,0.9))",
          backdropFilter: "blur(10px)",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <h2>Enter Your Details</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "80%",
              padding: "14px",
              margin: "15px auto",
              display: "block",
              fontSize: "16px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              boxShadow: "inset 0 2px 5px rgba(0,0,0,0.1)",
            }}
          />

          <input
            type="number"
            placeholder="Enter Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="3"
            max="14"
            style={{
              width: "80%",
              padding: "14px",
              margin: "15px auto",
              display: "block",
              fontSize: "16px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              boxShadow: "inset 0 2px 5px rgba(0,0,0,0.1)",
            }}
          />

          <button
            type="submit"
            style={{
              marginTop: "15px",
              padding: "12px 25px",
              background: "linear-gradient(45deg, #ff4081, #ff9800)",
              border: "none",
              color: "white",
              fontSize: "16px",
              borderRadius: "25px",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "15px",
              fontSize: "18px",
              fontWeight: "bold",
              color: "red",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default NextPage;