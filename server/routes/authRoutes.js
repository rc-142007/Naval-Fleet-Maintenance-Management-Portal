
const express = require("express");

const router = express.Router();

const {
  loginUser,
  createUser,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Public route - Login
router.post("/login", loginUser);

// Protected route - Admin creates Officer or Technician
router.post("/create-user", protect, createUser);

module.exports = router;
