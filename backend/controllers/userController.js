const User = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    const { name, age } = req.body;

    if (!name || !age) {
      return res.status(400).json({ message: "Name and age are required" });
    }

    const user = await User.create({ name, age });

    res.json({
      message: "User created successfully",
      userId: user._id,
      ageGroup: user.ageGroup
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};