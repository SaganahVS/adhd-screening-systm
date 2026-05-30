const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  age: {
    type: Number,
    required: true,
    min: 3,
    max: 14
  },

  ageGroup: {
    type: String,
    enum: ["3-8", "9-14"]
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Auto-set ageGroup based on age
userSchema.pre("save", function () {
  if (this.age >= 3 && this.age <= 8) {
    this.ageGroup = "3-8";
  } else if (this.age >= 9 && this.age <= 14) {
    this.ageGroup = "9-14";
  }
});

module.exports = mongoose.model("User", userSchema);