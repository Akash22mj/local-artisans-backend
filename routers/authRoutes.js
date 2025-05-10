const express = require("express");
const { registerUser, loginUser, logoutUser,forgotPassword } = require("../controllers/authController");

const router = express.Router();

// 📌 Register User
router.post("/register", registerUser);

// 📌 Login User
router.post("/login", loginUser);

// 📌 Logout User
router.post("/logout", logoutUser);

router.post("/forgot-password", forgotPassword);

module.exports = router;
