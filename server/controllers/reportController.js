
const Equipment = require("../models/Equipment");
const Maintenance = require("../models/Maintenance");
const Repair = require("../models/Repair");
const Problem = require("../models/Problem");
const User = require("../models/User");

// 1. Equipment statistics
const getEquipmentReport = async (req, res) => {
  try {
    const total = await Equipment.countDocuments({ isActive: true });

    const conditions = await Equipment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$condition",
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      totalEquipment: total,
      conditionStatistics: conditions
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate equipment report",
      error: error.message
    });
  }
};

// 2. Maintenance statistics
const getMaintenanceReport = async (req, res) => {
  try {
    const today = new Date();

    const total = await Maintenance.countDocuments();

    const completed = await Maintenance.countDocuments({
      status: "COMPLETED"
    });

    const scheduled = await Maintenance.countDocuments({
      status: "SCHEDULED"
    });

    const inProgress = await Maintenance.countDocuments({
      status: "IN_PROGRESS"
    });

    const overdue = await Maintenance.countDocuments({
      status: "SCHEDULED",
      scheduledDate: { $lt: today }
    });

    return res.status(200).json({
      totalMaintenance: total,
      completed,
      scheduled,
      inProgress,
      overdue
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate maintenance report",
      error: error.message
    });
  }
};

// 3. Repair statistics
const getRepairReport = async (req, res) => {
  try {
    const total = await Repair.countDocuments();

    const statistics = await Repair.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      totalRepairs: total,
      repairStatistics: statistics
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate repair report",
      error: error.message
    });
  }
};

// 4. Problem severity statistics
const getProblemReport = async (req, res) => {
  try {
    const total = await Problem.countDocuments();

    const severityStatistics = await Problem.aggregate([
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStatistics = await Problem.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      totalProblems: total,
      severityStatistics,
      statusStatistics
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate problem report",
      error: error.message
    });
  }
};

// 5. Technician workload report
const getTechnicianReport = async (req, res) => {
  try {
    const technicians = await User.find({
      role: "TECHNICIAN"
    }).select("name email isActive");

    const workload = await Promise.all(
      technicians.map(async (technician) => {
        const assignedRepairs = await Repair.countDocuments({
          assignedTo: technician._id
        });

        const completedRepairs = await Repair.countDocuments({
          assignedTo: technician._id,
          status: "APPROVED"
        });

        const assignedMaintenance = await Maintenance.countDocuments({
          assignedTo: technician._id
        });

        const completedMaintenance = await Maintenance.countDocuments({
          assignedTo: technician._id,
          status: "COMPLETED"
        });

        return {
          technician: technician.name,
          email: technician.email,
          isActive: technician.isActive,
          assignedRepairs,
          completedRepairs,
          assignedMaintenance,
          completedMaintenance
        };
      })
    );

    return res.status(200).json({
      technicianCount: technicians.length,
      workload
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate technician report",
      error: error.message
    });
  }
};

// 6. Overall dashboard summary
const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalEquipment,
      totalProblems,
      totalRepairs,
      totalMaintenance,
      activeTechnicians,
      pendingRepairs,
      overdueMaintenance
    ] = await Promise.all([
      Equipment.countDocuments({ isActive: true }),
      Problem.countDocuments(),
      Repair.countDocuments(),
      Maintenance.countDocuments(),
      User.countDocuments({
        role: "TECHNICIAN",
        isActive: true
      }),
      Repair.countDocuments({
        status: {
          $in: [
            "PENDING",
            "STARTED",
            "FINISHED",
            "UNDER_VERIFICATION",
            "REWORK_REQUIRED"
          ]
        }
      }),
      Maintenance.countDocuments({
        status: "SCHEDULED",
        scheduledDate: { $lt: new Date() }
      })
    ]);

    return res.status(200).json({
      totalEquipment,
      totalProblems,
      totalRepairs,
      totalMaintenance,
      activeTechnicians,
      pendingRepairs,
      overdueMaintenance
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate dashboard summary",
      error: error.message
    });
  }
};

module.exports = {
  getEquipmentReport,
  getMaintenanceReport,
  getRepairReport,
  getProblemReport,
  getTechnicianReport,
  getDashboardSummary
};
