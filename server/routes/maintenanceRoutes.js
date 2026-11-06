
const express = require("express");
const router = express.Router();

const {
  createMaintenance,
  getAllMaintenance,
  startMaintenance,
  completeMaintenance
} = require("../controllers/maintenanceController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Admin / Officer schedules maintenance
router.post(
  "/",
  protect,
  allowRoles("ADMIN", "OFFICER"),
  createMaintenance
);

// All roles can access their permitted schedules
router.get(
  "/",
  protect,
  allowRoles("ADMIN", "OFFICER", "TECHNICIAN"),
  getAllMaintenance
);

// Technician starts maintenance
router.patch(
  "/:id/start",
  protect,
  allowRoles("TECHNICIAN"),
  startMaintenance
);

// Technician completes maintenance
router.patch(
  "/:id/complete",
  protect,
  allowRoles("TECHNICIAN"),
  completeMaintenance
);

module.exports = router;
