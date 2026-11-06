
const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true
    },

    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    inspectionType: {
      type: String,
      enum: ["ROUTINE", "UNSCHEDULED", "FOLLOW_UP"],
      default: "ROUTINE"
    },

    inspectionDate: {
      type: Date,
      default: Date.now
    },

    findings: {
      type: String,
      required: [true, "Inspection findings are required"],
      trim: true
    },

    condition: {
      type: String,
      enum: [
        "OPERATIONAL",
        "NEEDS_INSPECTION",
        "UNDER_MAINTENANCE",
        "NON_OPERATIONAL"
      ],
      required: true
    },

    recommendations: {
      type: String,
      default: "",
      trim: true
    },

    remarks: {
      type: String,
      default: "",
      trim: true
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
},

    status: {
      type: String,
      enum: ["SUBMITTED", "REVIEWED"],
      default: "SUBMITTED"
    }
  },
  {
    timestamps: true
  }
);

// Improve equipment inspection history queries
inspectionSchema.index({
  equipment: 1,
  inspectionDate: -1
});

const Inspection = mongoose.model(
  "Inspection",
  inspectionSchema
);

module.exports = Inspection;
