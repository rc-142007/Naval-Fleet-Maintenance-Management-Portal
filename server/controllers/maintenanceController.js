
const Maintenance = require("../models/Maintenance");
const Equipment = require("../models/Equipment");
const User = require("../models/User");

// ==========================================
// 1. ADMIN / OFFICER SCHEDULES MAINTENANCE
// ==========================================

const createMaintenance = async (req, res) => {
  try {
    if (!["ADMIN", "OFFICER"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Officer can schedule maintenance"
      });
    }

    const {
      equipmentId,
      technicianId,
      maintenanceType,
      title,
      description,
      scheduledDate
    } = req.body;

    if (!equipmentId || !maintenanceType || !title || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    const validTypes = [
      "PREVENTIVE",
      "CORRECTIVE",
      "ROUTINE",
      "EMERGENCY"
    ];

    if (!validTypes.includes(maintenanceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance type"
      });
    }

    const date = new Date(scheduledDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date"
      });
    }

    const equipment = await Equipment.findOne({
      equipmentId,
      isActive: true
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Active equipment not found"
      });
    }

    let technician = null;

    if (technicianId) {
      technician = await User.findOne({
        _id: technicianId,
        role: "TECHNICIAN",
        isActive: true
      });

      if (!technician) {
        return res.status(404).json({
          success: false,
          message: "Active Technician not found"
        });
      }

      // Verify Technician is assigned to this equipment
      const isAssigned = equipment.assignedTechnicians.some(
        id => id.toString() === technician._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "Technician is not assigned to this equipment"
        });
      }
    }

    const maintenance = await Maintenance.create({
      equipment: equipment._id,
      scheduledBy: req.user._id,
      assignedTo: technician ? technician._id : null,
      maintenanceType,
      title,
      description: description || "",
      scheduledDate: date
    });

    equipment.nextMaintenanceDate = date;
    await equipment.save();

    return res.status(201).json({
      success: true,
      message: "Maintenance scheduled successfully",
      maintenance
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to schedule maintenance",
      error: error.message
    });
  }
};

// ==========================================
// 2. VIEW MAINTENANCE SCHEDULES
// ==========================================

const getAllMaintenance = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "TECHNICIAN") {
      filter.assignedTo = req.user._id;
    } else if (!["ADMIN", "OFFICER"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const maintenance = await Maintenance.find(filter)
      .populate("equipment", "equipmentId name condition")
      .populate("scheduledBy", "name email")
      .populate("assignedTo", "name email")
      .populate("completedBy", "name email")
      .sort({ scheduledDate: 1 });

    const today = new Date();

    const schedules = maintenance.map((item) => {
      const data = item.toObject();

      if (
        item.status === "SCHEDULED" &&
        new Date(item.scheduledDate) < today
      ) {
        data.scheduleStatus = "OVERDUE";
      } else if (
        item.status === "SCHEDULED" &&
        new Date(item.scheduledDate).toDateString() === today.toDateString()
      ) {
        data.scheduleStatus = "DUE";
      } else {
        data.scheduleStatus = item.status;
      }

      return data;
    });

    return res.status(200).json({
      success: true,
      count: schedules.length,
      maintenance: schedules
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch maintenance schedules",
      error: error.message
    });
  }
};

// ==========================================
// 3. TECHNICIAN STARTS ASSIGNED MAINTENANCE
// ==========================================

const startMaintenance = async (req, res) => {
  try {
    if (req.user.role !== "TECHNICIAN") {
      return res.status(403).json({
        success: false,
        message: "Only Technicians can start maintenance"
      });
    }

    const maintenance = await Maintenance.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
      status: "SCHEDULED"
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "Assigned maintenance not found"
      });
    }

    maintenance.status = "IN_PROGRESS";
    await maintenance.save();

    return res.status(200).json({
      success: true,
      message: "Maintenance started successfully",
      maintenance
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to start maintenance",
      error: error.message
    });
  }
};

// ==========================================
// 4. TECHNICIAN COMPLETES MAINTENANCE
// ==========================================

const completeMaintenance = async (req, res) => {
  try {
    if (req.user.role !== "TECHNICIAN") {
      return res.status(403).json({
        success: false,
        message: "Only Technicians can complete maintenance"
      });
    }

    const { completionDetails, nextMaintenanceDate } = req.body;

    if (
      typeof completionDetails !== "string" ||
      !completionDetails.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Completion details are required"
      });
    }

    const maintenance = await Maintenance.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
      status: "IN_PROGRESS"
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: "In-progress maintenance not found"
      });
    }

    let nextDate = null;

    if (nextMaintenanceDate) {
      nextDate = new Date(nextMaintenanceDate);

      if (
        Number.isNaN(nextDate.getTime()) ||
        nextDate <= new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "Next maintenance date must be a valid future date"
        });
      }
    }

    maintenance.status = "COMPLETED";
    maintenance.completionDetails = completionDetails.trim();
    maintenance.completedBy = req.user._id;
    maintenance.completedAt = new Date();
    maintenance.nextMaintenanceDate = nextDate;

    await maintenance.save();

    // Update equipment maintenance history
    const equipmentUpdates = {
      lastMaintenanceDate: maintenance.completedAt
    };

    // Preserve the existing date if no new date is provided
    if (nextDate) {
      equipmentUpdates.nextMaintenanceDate = nextDate;
    }

    await Equipment.findByIdAndUpdate(
      maintenance.equipment,
      equipmentUpdates,
      { runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Maintenance completed successfully",
      maintenance
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to complete maintenance",
      error: error.message
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  createMaintenance,
  getAllMaintenance,
  startMaintenance,
  completeMaintenance
};
