
const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

// All authenticated roles can access their own notifications
router.use(
  protect,
  allowRoles("ADMIN", "OFFICER", "TECHNICIAN")
);

// Get notifications
router.get("/", getMyNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark all as read
router.patch("/read-all", markAllAsRead);

// Mark one as read
router.patch("/:id/read", markAsRead);

module.exports = router;
