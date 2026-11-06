
const express = require("express");
const router = express.Router();

const {
  createProblem,
  getAllProblems,
  getProblemById,
  reviewProblem
} = require("../controllers/problemController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// Technician reports a problem
router.post(
  "/",
  protect,
  allowRoles("TECHNICIAN"),
  createProblem
);

// Admin / Officer views all problems
router.get(
  "/",
  protect,
  allowRoles("ADMIN", "OFFICER", "TECHNICIAN"),
  getAllProblems
);

router.get(
  "/:id",
  protect,
  allowRoles("ADMIN", "OFFICER", "TECHNICIAN"),
  getProblemById
);
// Admin / Officer reviews problem
router.patch(
  "/:id/review",
  protect,
  allowRoles("ADMIN", "OFFICER"),
  reviewProblem
);

module.exports = router;
