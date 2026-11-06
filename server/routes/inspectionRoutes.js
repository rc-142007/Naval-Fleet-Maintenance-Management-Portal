
const express = require("express");
const router = express.Router();

const {
  createInspection,
  getAllInspections,
  getInspectionById,
  reviewInspection
} = require("../controllers/inspectionController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Technician submits inspection
router.post(
  "/",
  protect,
  allowRoles("TECHNICIAN"),
  createInspection
);

router.get(
  "/",
  protect,
  allowRoles("ADMIN", "OFFICER", "TECHNICIAN"),
  getAllInspections
);

router.get(
  "/:id",
  protect,
  allowRoles("ADMIN", "OFFICER", "TECHNICIAN"),
  getInspectionById
);

// Admin / Officer reviews inspection
router.patch(
  "/:id/review",
  protect,
  allowRoles("ADMIN", "OFFICER"),
  reviewInspection
);

module.exports = router;
