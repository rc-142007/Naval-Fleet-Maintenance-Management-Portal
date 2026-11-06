
const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    inspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inspection",
      default: null
    },
    title: {
      type: String,
      required: [true, "Problem title is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Problem description is required"],
      trim: true
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      required: true
    },
    status: {
      type: String,
      enum: [
        "REPORTED",
        "UNDER_REVIEW",
        "REPAIR_ASSIGNED",
        "RESOLVED",
        "CLOSED"
      ],
      default: "REPORTED"
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    reviewRemarks: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

problemSchema.index({ equipment: 1, createdAt: -1 });
problemSchema.index({ status: 1, severity: 1 });

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;
