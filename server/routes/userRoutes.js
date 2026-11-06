const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getActiveTechnicians,
  updateUserStatus
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

router.use(protect);

// Admin and Officer can view active Technicians
router.get(
  "/technicians",
  allowRoles("ADMIN", "OFFICER"),
  getActiveTechnicians
);

// Admin-only personnel management
router.use(allowRoles("ADMIN"));

router.get("/", getAllUsers);
router.patch("/:id/status", updateUserStatus);

module.exports = router;