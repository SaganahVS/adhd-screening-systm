const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// 🔥 Connect to MongoDB
connectDB();

// 🔥 Middleware
app.use(cors());
app.use(express.json());

// 📌 Routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/game", require("./routes/gameRoutes"));
app.use("/api/webcam", require("./routes/webcamRoutes"));
app.use("/api/questionnaire", require("./routes/questionnaireRoutes"));
app.use("/api/result", require("./routes/resultRoutes")); // create next

// 🏠 Test route (optional but useful)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 🚀 Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});