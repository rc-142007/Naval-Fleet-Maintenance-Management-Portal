
const Repair = require("../models/Repair");
const Problem = require("../models/Problem");
const Equipment = require("../models/Equipment");
const User = require("../models/User");

// 1. Officer assigns a repair to a Technician
const assignRepair = async (req, res) => {
  try {
    if (!["ADMIN", "OFFICER"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only Admin or Officer can assign repairs"
      });
    }

    const { problemId, technicianId } = req.body;

    if (!problemId || !technicianId) {
      return res.status(400).json({
        message: "Problem ID and Technician ID are required"
      });
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        message: "Problem report not found"
      });
    }

    if (!["REPORTED", "UNDER_REVIEW"].includes(problem.status)) {
      return res.status(400).json({
        message: "This problem cannot be assigned"
      });
    }

    const technician = await User.findOne({
      _id: technicianId,
      role: "TECHNICIAN",
      isActive: true
    });

    if (!technician) {
      return res.status(404).json({
        message: "Active Technician not found"
      });
    }

    const existingRepair = await Repair.findOne({
      problem: problem._id,
      status: { $nin: ["APPROVED"] }
    });

    if (existingRepair) {
      return res.status(400).json({
        message: "An active repair already exists for this problem"
      });
    }

    const repair = await Repair.create({
      problem: problem._id,
      equipment: problem.equipment,
      assignedBy: req.user._id,
      assignedTo: technician._id
    });

    problem.status = "REPAIR_ASSIGNED";
    await problem.save();

    return res.status(201).json({
      message: "Repair assigned successfully",
      repair
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to assign repair",
      error: error.message
    });
  }
};

// 2. Technician views assigned repairs
const getMyRepairs = async (req, res) => {
  try {
    if (req.user.role !== "TECHNICIAN") {
      return res.status(403).json({
        message: "Only Technicians can view their assigned repairs"
      });
    }

    const repairs = await Repair.find({
      assignedTo: req.user._id
    })
      .populate("problem")
      .populate("equipment", "equipmentId name condition")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: repairs.length,
      repairs
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch assigned repairs",
      error: error.message
    });
  }
};

// 3. Technician proposes a repair approach
const proposeRepair = async (req, res) => {
  try {
    const { proposedApproach } = req.body;

    if (req.user.role !== "TECHNICIAN") {
      return res.status(403).json({
        message: "Only Technicians can propose repairs"
      });
    }

    if (
      typeof proposedApproach !== "string" ||
      !proposedApproach.trim()
    ) {
      return res.status(400).json({
        message: "Repair approach is required"
      });
    }

    const repair = await Repair.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
      status: { $in: ["PENDING", "REWORK_REQUIRED"] }
    });

    if (!repair) {
      return res.status(404).json({
        message: "Assigned repair not found or cannot be updated"
      });
    }

    repair.proposedApproach = proposedApproach.trim();
    await repair.save();

    return res.status(200).json({
      message: "Repair approach submitted successfully",
      repair
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to submit repair approach",
      error: error.message
    });
  }
};

// 4. Technician starts repair
const startRepair = async (req, res) => {
  try {
    if (req.user.role !== "TECHNICIAN") {
      return res.status(403).json({
        message: "Only Technicians can start repairs"
      });
    }

    const repair = await Repair.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
      status: { $in: ["PENDING", "REWORK_REQUIRED"] }
    });

    if (!repair) {
      return res.status(404).json({
        message: "Assigned repair not found or cannot be started"
      });
    }

    if (
      !repair.proposedApproach ||
      !repair.proposedApproach.trim()
    ) {
      return res.status(400).json({
        message: "Please submit a repair approach before starting"
      });
    }

    repair.status = "STARTED";
    repair.startedAt = new Date();

    await repair.save();

    return res.status(200).json({
      message: "Repair started successfully",
      repair
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to start repair",
      error: error.message
    });
  }
};

// 5. Technician submits completed repair
const completeRepair = async (req, res) => {
  try {
    if (req.user.role !== "TECHNICIAN") {
      return res.status(403).json({
        message: "Only Technicians can complete repairs"
      });
    }

    const { actualRepairDetails } = req.body;

    if (
      typeof actualRepairDetails !== "string" ||
      !actualRepairDetails.trim()
    ) {
      return res.status(400).json({
        message: "Actual repair details are required"
      });
    }

    const repair = await Repair.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
      status: "STARTED"
    });

    if (!repair) {
      return res.status(404).json({
        message: "Started repair not found"
      });
    }

    repair.actualRepairDetails = actualRepairDetails.trim();
    repair.status = "UNDER_VERIFICATION";
    repair.completedAt = new Date();

    await repair.save();

    return res.status(200).json({
      message: "Repair submitted for verification",
      repair
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to submit completed repair",
      error: error.message
    });
  }
};

// 6. Officer verifies repair
const verifyRepair = async (req, res) => {
  try {
    if (!["ADMIN", "OFFICER"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only Admin or Officer can verify repairs"
      });
    }

    const { decision, verificationRemarks } = req.body;

    if (!["APPROVE", "REWORK"].includes(decision)) {
      return res.status(400).json({
        message: "Decision must be APPROVE or REWORK"
      });
    }

    const repair = await Repair.findOne({
      _id: req.params.id,
      status: "UNDER_VERIFICATION"
    });

    if (!repair) {
      return res.status(404).json({
        message: "Repair awaiting verification not found"
      });
    }

    repair.verifiedBy = req.user._id;
    repair.verifiedAt = new Date();
    repair.verificationRemarks = verificationRemarks || "";

    if (decision === "APPROVE") {
      repair.status = "APPROVED";

      await Equipment.findByIdAndUpdate(repair.equipment, {
        condition: "OPERATIONAL",
        lastMaintenanceDate: new Date()
      });

      await Problem.findByIdAndUpdate(repair.problem, {
        status: "RESOLVED"
      });
    } else {
      repair.status = "REWORK_REQUIRED";

      await Problem.findByIdAndUpdate(repair.problem, {
        status: "UNDER_REVIEW"
      });
    }

    await repair.save();

    return res.status(200).json({
      message:
        decision === "APPROVE"
          ? "Repair approved successfully"
          : "Repair returned for rework",
      repair
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify repair",
      error: error.message
    });
  }
};

// 7. Admin and Officer view all repairs
const getAllRepairs = async (req, res) => {
  try {
    if (!["ADMIN", "OFFICER"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only Admin or Officer can view all repairs"
      });
    }

    const repairs = await Repair.find()
      .populate("problem")
      .populate("equipment", "equipmentId name condition")
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email")
      .populate("verifiedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: repairs.length,
      repairs
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch repairs",
      error: error.message
    });
  }
};

module.exports = {
  assignRepair,
  getMyRepairs,
  proposeRepair,
  startRepair,
  completeRepair,
  verifyRepair,
  getAllRepairs
};
