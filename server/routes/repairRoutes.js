
const express = require("express");
const router = express.Router();

const {
  assignRepair,
  getMyRepairs,
  proposeRepair,
  startRepair,
  completeRepair,
  verifyRepair,
  getAllRepairs
} = require("../controllers/repairController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Admin / Officer assigns repairs
router.post(
  "/assign",
  protect,
  allowRoles("ADMIN", "OFFICER"),
  assignRepair
);

// Technician views assigned repairs
router.get(
  "/my-repairs",
  protect,
  allowRoles("TECHNICIAN"),
  getMyRepairs
);

// Admin / Officer views all repairs
router.get(
  "/",
  protect,
  allowRoles("ADMIN", "OFFICER"),
  getAllRepairs
);

// Technician proposes repair approach
router.patch(
  "/:id/propose",
  protect,
  allowRoles("TECHNICIAN"),
  proposeRepair
);

// Technician starts repair
router.patch(
  "/:id/start",
  protect,
  allowRoles("TECHNICIAN"),
  startRepair
);

// Technician completes repair
router.patch(
  "/:id/complete",
  protect,
  allowRoles("TECHNICIAN"),
  completeRepair
);

// Admin / Officer verifies repairs
router.patch(
  "/:id/verify",
  protect,
  allowRoles("ADMIN", "OFFICER"),
  verifyRepair
);

module.exports = router;
