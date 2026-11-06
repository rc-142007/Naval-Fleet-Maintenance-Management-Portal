
const express = require("express");
const router = express.Router();

const {
  getDashboardData
} = require("../controllers/dashboardController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// All three roles can access their own dashboard
router.get(
  "/",
  protect,
  allowRoles("ADMIN", "OFFICER", "TECHNICIAN"),
  getDashboardData
);

module.exports = router;
