
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        "MAINTENANCE",
        "PROBLEM",
        "REPAIR",
        "SYSTEM"
      ],
      default: "SYSTEM"
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    relatedModel: {
      type: String,
      enum: ["Maintenance", "Problem", "Repair", null],
      default: null
    },
    reminderType: {
      type: String,
      enum: [
        "15_DAYS",
        "7_DAYS",
        "2_DAYS",
        "DUE",
        "OVERDUE",
        null
      ],
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;

