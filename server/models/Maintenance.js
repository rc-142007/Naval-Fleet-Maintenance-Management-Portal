
const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true
    },
    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    maintenanceType: {
      type: String,
      enum: ["PREVENTIVE", "CORRECTIVE", "ROUTINE", "EMERGENCY"],
      required: true
    },
    title: {
      type: String,
      required: [true, "Maintenance title is required"],
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: [
        "SCHEDULED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED"
      ],
      default: "SCHEDULED"
    },
    completionDetails: {
      type: String,
      default: "",
      trim: true
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    nextMaintenanceDate: {
      type: Date,
      default: null
    },
    reminderSent: {
      type: [String],
      enum: ["15_DAYS", "7_DAYS", "2_DAYS", "DUE", "OVERDUE"],
      default: []
    }
  },
  { timestamps: true }
);

maintenanceSchema.index({ scheduledDate: 1, status: 1 });
maintenanceSchema.index({ assignedTo: 1, status: 1 });

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);

module.exports = Maintenance;
