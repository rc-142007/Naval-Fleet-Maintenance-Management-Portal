
const Inspection = require("../models/Inspection");
const Equipment = require("../models/Equipment");

// ==========================================
// 1. TECHNICIAN: CREATE / SUBMIT INSPECTION
// ==========================================
const createInspection = async (req, res) => {
  try {
    if (req.user.role !== "TECHNICIAN") {
      return res.status(403).json({
        success: false,
        message: "Only Technicians can submit inspections"
      });
    }

    const {
      equipmentId,
      inspectionType,
      inspectionDate,
      findings,
      condition,
      recommendations,
      remarks
    } = req.body;

    // Validate required fields
    if (!equipmentId || !findings || !condition) {
      return res.status(400).json({
        success: false,
        message: "Equipment, findings and condition are required"
      });
    }

    // Validate inspection type
    const allowedInspectionTypes = [
      "ROUTINE",
      "UNSCHEDULED",
      "FOLLOW_UP"
    ];

    if (
      inspectionType &&
      !allowedInspectionTypes.includes(inspectionType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid inspection type"
      });
    }

    // Validate equipment condition
    const allowedConditions = [
      "OPERATIONAL",
      "NEEDS_INSPECTION",
      "UNDER_MAINTENANCE",
      "NON_OPERATIONAL"
    ];

    if (!allowedConditions.includes(condition)) {
      return res.status(400).json({
        success: false,
        message: "Invalid equipment condition"
      });
    }

    // Find equipment
    // Inactive equipment is also allowed for inspection
    const equipment = await Equipment.findById(equipmentId);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    // Check whether this Technician is assigned to the equipment
    const isAssigned = equipment.assignedTechnicians.some(
      (technicianId) =>
        technicianId.toString() === req.user._id.toString()
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this equipment"
      });
    }

    // Create inspection record
    const inspection = await Inspection.create({
      equipment: equipment._id,
      inspectedBy: req.user._id,
      inspectionType: inspectionType || "ROUTINE",
      inspectionDate: inspectionDate || new Date(),
      findings,
      condition,
      recommendations: recommendations || "",
      remarks: remarks || ""
    });

    return res.status(201).json({
      success: true,
      message: "Inspection submitted successfully",
      inspection
    });

  } catch (error) {
    console.error("Create Inspection Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit inspection",
      error: error.message
    });
  }
};


// ==========================================
// 2. GET ALL INSPECTIONS
// ==========================================
const getAllInspections = async (req, res) => {
  try {
    let filter = {};

    // Technician can see only their own inspections
    if (req.user.role === "TECHNICIAN") {
      filter = {
        inspectedBy: req.user._id
      };
    }

    const inspections = await Inspection.find(filter)
      .populate("equipment", "equipmentId name category condition")
      .populate("inspectedBy", "name email role")
      .populate("reviewedBy", "name email role")
      .sort({ inspectionDate: -1 });

    return res.status(200).json({
      success: true,
      count: inspections.length,
      inspections
    });

  } catch (error) {
    console.error("Get All Inspections Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inspections",
      error: error.message
    });
  }
};


// ==========================================
// 3. GET SINGLE INSPECTION BY ID
// ==========================================
const getInspectionById = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate("equipment", "equipmentId name category condition")
      .populate("inspectedBy", "name email role")
      .populate("reviewedBy", "name email role");

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found"
      });
    }

    // Technician can access only their own inspection
    if (
      req.user.role === "TECHNICIAN" &&
      inspection.inspectedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this inspection"
      });
    }

    return res.status(200).json({
      success: true,
      inspection
    });

  } catch (error) {
    console.error("Get Inspection By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inspection",
      error: error.message
    });
  }
};


// ==========================================
// 4. ADMIN / OFFICER: REVIEW INSPECTION
// ==========================================
const reviewInspection = async (req, res) => {
  try {
    if (!["ADMIN", "OFFICER"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Officer can review inspections"
      });
    }

    const { reviewRemarks } = req.body;

    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found"
      });
    }

    if (inspection.status === "REVIEWED") {
      return res.status(400).json({
        success: false,
        message: "This inspection has already been reviewed"
      });
    }

    inspection.status = "REVIEWED";
    inspection.reviewedBy = req.user._id;
    inspection.reviewRemarks = reviewRemarks || "";

    await inspection.save();

    return res.status(200).json({
      success: true,
      message: "Inspection reviewed successfully",
      inspection
    });

  } catch (error) {
    console.error("Review Inspection Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review inspection",
      error: error.message
    });
  }
};


// ==========================================
// EXPORT ALL FUNCTIONS
// ==========================================
module.exports = {
  createInspection,
  getAllInspections,
  getInspectionById,
  reviewInspection
};
