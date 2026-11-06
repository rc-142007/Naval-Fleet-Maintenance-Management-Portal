
const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: String,
      required: [true, "Equipment ID is required"],
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: [true, "Equipment name is required"],
      trim: true
    },

    category: {
      type: String,
      required: [true, "Equipment category is required"],
      trim: true
    },

    vesselReference: {
      type: String,
      required: [true, "Vessel reference is required"],
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    specifications: {
      type: String,
      default: ""
    },

    installationDate: {
      type: Date,
      required: true
    },

    lastMaintenanceDate: {
      type: Date,
      default: null
    },

    nextMaintenanceDate: {
      type: Date,
      default: null
    },

    condition: {
      type: String,
      enum: [
        "OPERATIONAL",
        "NEEDS_INSPECTION",
        "UNDER_MAINTENANCE",
        "NON_OPERATIONAL"
      ],
      default: "OPERATIONAL"
    },

    // Technicians assigned to this equipment
    assignedTechnicians: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    // Admin or Officer who assigned the equipment
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // Date and time of the latest assignment
    assignedAt: {
      type: Date,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Equipment =
  mongoose.models.Equipment ||
  mongoose.model("Equipment", equipmentSchema);

module.exports = Equipment;
