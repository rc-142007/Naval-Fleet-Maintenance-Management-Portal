
const mongoose = require("mongoose");
const Equipment = require("../models/Equipment");
const User = require("../models/User");

// ==========================================
// 1. REGISTER NEW EQUIPMENT
// ==========================================

const createEquipment = async (req, res) => {
  try {
    if (!req.user || !["ADMIN", "OFFICER"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin and Officer can register equipment"
      });
    }

    const {
      equipmentId,
      name,
      category,
      vesselReference,
      description,
      specifications,
      installationDate,
      lastMaintenanceDate,
      nextMaintenanceDate
    } = req.body;

    if (
      !equipmentId ||
      !name ||
      !category ||
      !vesselReference ||
      !description ||
      !installationDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required equipment details"
      });
    }

    const existingEquipment = await Equipment.findOne({
      equipmentId: equipmentId.trim()
    });

    if (existingEquipment) {
      return res.status(409).json({
        success: false,
        message: "Equipment ID already exists"
      });
    }

    const equipment = await Equipment.create({
      equipmentId: equipmentId.trim(),
      name,
      category,
      vesselReference,
      description,
      specifications,
      installationDate,
      lastMaintenanceDate: lastMaintenanceDate || null,
      nextMaintenanceDate: nextMaintenanceDate || null,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Equipment registered successfully",
      equipment
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Equipment registration failed",
      error: error.message
    });
  }
};


// ==========================================
// 2. ASSIGN TECHNICIANS TO EQUIPMENT
// ==========================================

const assignTechnicians = async (req, res) => {
  try {
    if (!req.user || !["ADMIN", "OFFICER"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Officer can assign Technicians"
      });
    }

    const { technicianIds } = req.body;

    if (!Array.isArray(technicianIds) || technicianIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one Technician ID"
      });
    }

    const validIds = technicianIds.every(
      id => mongoose.Types.ObjectId.isValid(id)
    );

    if (!validIds) {
      return res.status(400).json({
        success: false,
        message: "One or more Technician IDs are invalid"
      });
    }

    const uniqueIds = [
      ...new Set(technicianIds.map(id => id.toString()))
    ];

    if (uniqueIds.length !== technicianIds.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate Technician IDs are not allowed"
      });
    }

    // Allow assignment to BOTH active and inactive equipment
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    // Only active Technician accounts can be assigned
    const technicians = await User.find({
      _id: { $in: uniqueIds },
      role: "TECHNICIAN",
      isActive: true
    }).select("_id");

    if (technicians.length !== uniqueIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more IDs do not belong to active Technicians"
      });
    }

    equipment.assignedTechnicians = technicians.map(
      technician => technician._id
    );

    equipment.assignedBy = req.user._id;
    equipment.assignedAt = new Date();

    await equipment.save();

    await equipment.populate(
      "assignedTechnicians",
      "name email role"
    );

    await equipment.populate(
      "assignedBy",
      "name email role"
    );

    return res.status(200).json({
      success: true,
      message: "Technicians assigned successfully",
      equipment
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Technician assignment failed",
      error: error.message
    });
  }
};


// ==========================================
// 3. GET ALL EQUIPMENT
// ==========================================

const getAllEquipment = async (req, res) => {
  try {
    let filter = {};

   if (req.user.role === "TECHNICIAN") {
  filter = {
    assignedTechnicians: req.user._id
  };
}

    const equipment = await Equipment.find(filter)
      .populate("createdBy", "name email role")
      .populate("assignedTechnicians", "name email role")
      .populate("assignedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: equipment.length,
      equipment
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch equipment",
      error: error.message
    });
  }
};


// ==========================================
// 4. GET EQUIPMENT BY ID
// ==========================================

const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("assignedTechnicians", "name email role")
      .populate("assignedBy", "name email role");

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    if (
      req.user.role === "TECHNICIAN" &&
      !equipment.assignedTechnicians.some(
        technician =>
          technician._id.toString() === req.user._id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this equipment"
      });
    }

    return res.status(200).json({
      success: true,
      equipment
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid equipment ID",
      error: error.message
    });
  }
};


// ==========================================
// 5. UPDATE EQUIPMENT DETAILS
// ==========================================

const updateEquipment = async (req, res) => {
  try {
    if (!req.user || !["ADMIN", "OFFICER"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin and Officer can update equipment"
      });
    }

    const {
      _id,
      equipmentId,
      createdBy,
      assignedTechnicians,
      assignedBy,
      assignedAt,
      isActive,
      ...updates
    } = req.body;

    const allowedFields = [
      "name",
      "category",
      "vesselReference",
      "description",
      "specifications",
      "installationDate",
      "lastMaintenanceDate",
      "nextMaintenanceDate",
      "condition"
    ];

    const safeUpdates = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        safeUpdates[field] = updates[field];
      }
    }

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      safeUpdates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Equipment updated successfully",
      equipment
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Equipment update failed",
      error: error.message
    });
  }
};


// ==========================================
// 6. ACTIVATE / DEACTIVATE EQUIPMENT
// ==========================================

const updateEquipmentStatus = async (req, res) => {
  try {
 if (!req.user || !["ADMIN", "OFFICER"].includes(req.user.role)) {
  return res.status(403).json({
    success: false,
    message: "Only Admin and Officer can change equipment status"
  });
}

    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid equipment status"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid equipment ID"
      });
    }

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { isActive },
      {
        new: true,
        runValidators: true
      }
    );

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: `Equipment ${isActive ? "activated" : "deactivated"} successfully`,
      equipment
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Equipment status update failed",
      error: error.message
    });
  }
};


// ==========================================
// 7. LEGACY DEACTIVATE ENDPOINT
// ==========================================

const deactivateEquipment = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Admin can deactivate equipment"
      });
    }

    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Equipment deactivated successfully",
      equipment
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Equipment deactivation failed",
      error: error.message
    });
  }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  createEquipment,
  assignTechnicians,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  updateEquipmentStatus,
  deactivateEquipment
};
