
const express = require("express");
const router = express.Router();

const {
  createEquipment,
  assignTechnicians,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  updateEquipmentStatus,
  deactivateEquipment
} = require("../controllers/equipmentController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Register new equipment
router.post(
  "/",
  protect,
  allowRoles("ADMIN", "OFFICER"),
  createEquipment
);

// Assign Technicians to equipment
router.patch(
  "/:id/assign-technicians",
  protect,
  allowRoles("ADMIN", "OFFICER"),
  assignTechnicians
);

// Get all equipment
router.get(
  "/",
  protect,
  allowRoles("ADMIN", "OFFICER", "TECHNICIAN"),
  getAllEquipment
);

// Get equipment by ID
router.get(
  "/:id",
  protect,
  allowRoles("ADMIN", "OFFICER", "TECHNICIAN"),
  getEquipmentById
);

// Update equipment details
router.put(
  "/:id",
  protect,
  allowRoles("ADMIN", "OFFICER"),
  updateEquipment
);

// Activate / Deactivate equipment
// Both Admin and Officer are authorized
router.patch(
  "/:id/status",
  protect,
  allowRoles("ADMIN", "OFFICER"),
  updateEquipmentStatus
);

// Dedicated deactivation endpoint (Admin only)
router.patch(
  "/:id/deactivate",
  protect,
  allowRoles("ADMIN"),
  deactivateEquipment
);

module.exports = router;
