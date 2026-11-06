
const Problem = require("../models/Problem");
const Equipment = require("../models/Equipment");
const Inspection = require("../models/Inspection");

// ==========================================
// 1. TECHNICIAN: CREATE PROBLEM REPORT
// ==========================================
const createProblem = async (req, res) => {
  try {
    if (req.user.role !== "TECHNICIAN") {
      return res.status(403).json({
        success: false,
        message: "Only Technicians can report problems"
      });
    }

    const {
      equipmentId,
      inspectionId,
      title,
      description,
      severity
    } = req.body;

    // Validate required fields
    if (
      !equipmentId ||
      !title?.trim() ||
      !description?.trim() ||
      !severity
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Validate severity
    const validSeverities = [
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL"
    ];

    if (!validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid problem severity"
      });
    }

    // Find equipment (active and inactive)
    const equipment = await Equipment.findOne({
      equipmentId
    });

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found"
      });
    }

    // Verify Technician assignment
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

    // Validate optional inspection reference
    let inspection = null;

    if (inspectionId) {
      inspection = await Inspection.findOne({
        _id: inspectionId,
        equipment: equipment._id,
        inspectedBy: req.user._id
      });

      if (!inspection) {
        return res.status(400).json({
          success: false,
          message: "Invalid inspection for this equipment"
        });
      }
    }

    // Create problem report
    const problem = await Problem.create({
      equipment: equipment._id,
      reportedBy: req.user._id,
      inspection: inspection ? inspection._id : null,
      title: title.trim(),
      description: description.trim(),
      severity
    });

    return res.status(201).json({
      success: true,
      message: "Problem reported successfully",
      problem
    });

  } catch (error) {
    console.error("Create Problem Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to report problem",
      error: error.message
    });
  }
};


// ==========================================
// 2. GET ALL PROBLEM REPORTS
// ==========================================
const getAllProblems = async (req, res) => {
  try {
    let filter = {};

    // Technician sees only their own reports
    if (req.user.role === "TECHNICIAN") {
      filter.reportedBy = req.user._id;
    }

    const problems = await Problem.find(filter)
      .populate("equipment", "equipmentId name category condition")
      .populate("reportedBy", "name email role")
      .populate("inspection")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: problems.length,
      problems
    });

  } catch (error) {
    console.error("Get All Problems Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch problem reports",
      error: error.message
    });
  }
};


// ==========================================
// 3. GET SINGLE PROBLEM REPORT
// ==========================================
const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate("equipment")
      .populate("reportedBy", "name email role")
      .populate("inspection")
      .populate("reviewedBy", "name email");

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem report not found"
      });
    }

    // Technician can access only their own reports
    if (
      req.user.role === "TECHNICIAN" &&
      (
        !problem.reportedBy ||
        problem.reportedBy._id.toString() !== req.user._id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this problem report"
      });
    }

    return res.status(200).json({
      success: true,
      problem
    });

  } catch (error) {
    console.error("Get Problem By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch problem report",
      error: error.message
    });
  }
};


// ==========================================
// 4. ADMIN / OFFICER: REVIEW PROBLEM
// ==========================================
const reviewProblem = async (req, res) => {
  try {
    if (!["ADMIN", "OFFICER"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Officer can review problems"
      });
    }

    const { reviewRemarks } = req.body;

    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem report not found"
      });
    }

    if (problem.status !== "REPORTED") {
      return res.status(400).json({
        success: false,
        message: "This problem has already been reviewed or processed"
      });
    }

    problem.status = "UNDER_REVIEW";
    problem.reviewedBy = req.user._id;
    problem.reviewRemarks = reviewRemarks || "";

    await problem.save();

    return res.status(200).json({
      success: true,
      message: "Problem reviewed successfully",
      problem
    });

  } catch (error) {
    console.error("Review Problem Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to review problem",
      error: error.message
    });
  }
};


// ==========================================
// EXPORT CONTROLLER FUNCTIONS
// ==========================================
module.exports = {
  createProblem,
  getAllProblems,
  getProblemById,
  reviewProblem
};
