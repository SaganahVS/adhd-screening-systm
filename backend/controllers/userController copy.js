const User = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    const { name, age } = req.body;

    if (!name || age === undefined || age === null) {
      return res.status(400).json({
        message: "Name and age are required",
      });
    }

    const numericAge = Number(age);

    if (isNaN(numericAge)) {
      return res.status(400).json({
        message: "Age must be a valid number",
      });
    }

    if (numericAge < 3 || numericAge > 14) {
      return res.status(400).json({
        message: "Age must be between 3 and 14",
      });
    }

    const user = await User.create({
      name: name.trim(),
      age: numericAge,
    });

    res.status(201).json({
      message: "User created successfully",
      userId: user._id,
      ageGroup: user.ageGroup,
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};
