
const mongoose = require("mongoose");

const repairSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    proposedApproach: {
      type: String,
      default: "",
      trim: true
    },
    actualRepairDetails: {
      type: String,
      default: "",
      trim: true
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    verificationRemarks: {
      type: String,
      default: "",
      trim: true
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "STARTED",
        "FINISHED",
        "UNDER_VERIFICATION",
        "REWORK_REQUIRED",
        "APPROVED"
      ],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

repairSchema.index({ assignedTo: 1, status: 1 });
repairSchema.index({ equipment: 1, createdAt: -1 });

const Repair = mongoose.model("Repair", repairSchema);

module.exports = Repair;
