
const User = require("../models/User");
const Equipment = require("../models/Equipment");
const Inspection = require("../models/Inspection");
const Problem = require("../models/Problem");
const Repair = require("../models/Repair");
const Maintenance = require("../models/Maintenance");
const Notification = require("../models/Notification");

// Get dashboard data based on logged-in user's role
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    const unreadNotifications = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    // ADMIN DASHBOARD
    if (role === "ADMIN") {
      const [
        totalUsers,
        totalOfficers,
        totalTechnicians,
        totalEquipment,
        totalProblems,
        totalRepairs,
        totalMaintenance,
        pendingRepairs,
        overdueMaintenance
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "OFFICER" }),
        User.countDocuments({ role: "TECHNICIAN" }),
        Equipment.countDocuments({ isActive: true }),
        Problem.countDocuments(),
        Repair.countDocuments(),
        Maintenance.countDocuments(),
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
        role,
        dashboard: {
          totalUsers,
          totalOfficers,
          totalTechnicians,
          totalEquipment,
          totalProblems,
          totalRepairs,
          totalMaintenance,
          pendingRepairs,
          overdueMaintenance,
          unreadNotifications
        }
      });
    }

    // OFFICER DASHBOARD
    if (role === "OFFICER") {
      const [
        totalEquipment,
        operationalEquipment,
        equipmentNeedingInspection,
        totalInspections,
        pendingInspections,
        totalProblems,
        reportedProblems,
        totalRepairs,
        repairsAwaitingVerification,
        totalMaintenance,
        overdueMaintenance
      ] = await Promise.all([
        Equipment.countDocuments({ isActive: true }),
        Equipment.countDocuments({
          isActive: true,
          condition: "OPERATIONAL"
        }),
        Equipment.countDocuments({
          isActive: true,
          condition: "NEEDS_INSPECTION"
        }),
        Inspection.countDocuments(),
        Inspection.countDocuments({ status: "SUBMITTED" }),
        Problem.countDocuments(),
        Problem.countDocuments({ status: "REPORTED" }),
        Repair.countDocuments(),
        Repair.countDocuments({ status: "UNDER_VERIFICATION" }),
        Maintenance.countDocuments(),
        Maintenance.countDocuments({
          status: "SCHEDULED",
          scheduledDate: { $lt: new Date() }
        })
      ]);

      return res.status(200).json({
        role,
        dashboard: {
          totalEquipment,
          operationalEquipment,
          equipmentNeedingInspection,
          totalInspections,
          pendingInspections,
          totalProblems,
          reportedProblems,
          totalRepairs,
          repairsAwaitingVerification,
          totalMaintenance,
          overdueMaintenance,
          unreadNotifications
        }
      });
    }

    // TECHNICIAN DASHBOARD
    if (role === "TECHNICIAN") {
      const [
        totalInspections,
        totalProblemsReported,
        assignedRepairs,
        pendingRepairs,
        completedRepairs,
        assignedMaintenance,
        pendingMaintenance,
        completedMaintenance
      ] = await Promise.all([
        Inspection.countDocuments({ inspectedBy: userId }),
        Problem.countDocuments({ reportedBy: userId }),
        Repair.countDocuments({ assignedTo: userId }),
        Repair.countDocuments({
          assignedTo: userId,
          status: {
            $in: ["PENDING", "STARTED", "REWORK_REQUIRED"]
          }
        }),
        Repair.countDocuments({
          assignedTo: userId,
          status: "APPROVED"
        }),
        Maintenance.countDocuments({ assignedTo: userId }),
        Maintenance.countDocuments({
          assignedTo: userId,
          status: { $in: ["SCHEDULED", "IN_PROGRESS"] }
        }),
        Maintenance.countDocuments({
          assignedTo: userId,
          status: "COMPLETED"
        })
      ]);

      return res.status(200).json({
        role,
        dashboard: {
          totalInspections,
          totalProblemsReported,
          assignedRepairs,
          pendingRepairs,
          completedRepairs,
          assignedMaintenance,
          pendingMaintenance,
          completedMaintenance,
          unreadNotifications
        }
      });
    }

    return res.status(403).json({
      message: "Invalid user role"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to load dashboard data",
      error: error.message
    });
  }
};

module.exports = { getDashboardData };
