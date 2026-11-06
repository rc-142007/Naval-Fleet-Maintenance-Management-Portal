
const Notification = require("../models/Notification");

// 1. Get logged-in user's notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      count: notifications.length,
      notifications
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
};

// 2. Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    return res.status(200).json({ unreadCount: count });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch unread count",
      error: error.message
    });
  }
};

// 3. Mark one notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();

    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update notification",
      error: error.message
    });
  }
};

// 4. Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    return res.status(200).json({
      message: "All notifications marked as read"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update notifications",
      error: error.message
    });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
