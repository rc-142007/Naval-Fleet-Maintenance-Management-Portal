
const express = require("express");
const router = express.Router();

const {
  getEquipmentReport,
  getMaintenanceReport,
  getRepairReport,
  getProblemReport,
  getTechnicianReport,
  getDashboardSummary
} = require("../controllers/reportController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Only Admin and Officer can access reports
router.use(
  protect,
  allowRoles("ADMIN", "OFFICER")
);

router.get("/dashboard", getDashboardSummary);
router.get("/equipment", getEquipmentReport);
router.get("/maintenance", getMaintenanceReport);
router.get("/repairs", getRepairReport);
router.get("/problems", getProblemReport);
router.get("/technicians", getTechnicianReport);

module.exports = router;
