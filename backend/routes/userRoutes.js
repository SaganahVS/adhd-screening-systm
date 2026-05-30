const express = require("express");
const router = express.Router();

const { createUser } = require("../controllers/userController");

// 👤 Create user (name + age)
router.post("/", createUser);

module.exports = router;