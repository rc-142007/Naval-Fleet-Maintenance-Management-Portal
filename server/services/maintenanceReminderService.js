
const cron = require("node-cron");
const Maintenance = require("../models/Maintenance");
const Notification = require("../models/Notification");

const checkMaintenanceReminders = async (io) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const maintenanceRecords = await Maintenance.find({
      status: "SCHEDULED",
      assignedTo: { $ne: null }
    });

    for (const record of maintenanceRecords) {
      const scheduledDate = new Date(record.scheduledDate);
      scheduledDate.setHours(0, 0, 0, 0);

      const daysLeft = Math.round(
        (scheduledDate - today) / (1000 * 60 * 60 * 24)
      );

      let reminderType = null;
      let title = "";
      let message = "";

      if (daysLeft === 15 && !record.reminderSent.includes("15_DAYS")) {
        reminderType = "15_DAYS";
        title = "Maintenance Upcoming";
        message = `Maintenance for ${record.title} is scheduled in 15 days.`;
      } else if (
        daysLeft === 7 &&
        !record.reminderSent.includes("7_DAYS")
      ) {
        reminderType = "7_DAYS";
        title = "Maintenance Reminder";
        message = `Maintenance for ${record.title} is scheduled in 7 days.`;
      } else if (
        daysLeft === 2 &&
        !record.reminderSent.includes("2_DAYS")
      ) {
        reminderType = "2_DAYS";
        title = "Maintenance Due Soon";
        message = `Maintenance for ${record.title} is scheduled in 2 days.`;
      } else if (
        daysLeft === 0 &&
        !record.reminderSent.includes("DUE")
      ) {
        reminderType = "DUE";
        title = "Maintenance Due Today";
        message = `Maintenance for ${record.title} is due today.`;
      } else if (
        daysLeft < 0 &&
        !record.reminderSent.includes("OVERDUE")
      ) {
        reminderType = "OVERDUE";
        title = "Maintenance Overdue";
        message = `Maintenance for ${record.title} is overdue.`;
      }

      if (!reminderType) {
        continue;
      }

      const notification = await Notification.create({
        recipient: record.assignedTo,
        title,
        message,
        type: "MAINTENANCE",
        relatedId: record._id,
        relatedModel: "Maintenance",
        reminderType
      });

      record.reminderSent.push(reminderType);
      await record.save();

      // Send live notification to the assigned Technician
      if (io) {
        io.to(`user_${record.assignedTo}`).emit(
          "newNotification",
          notification
        );
      }

      console.log(
        `Maintenance ${reminderType} reminder sent: ${record.title}`
      );
    }
  } catch (error) {
    console.error("Maintenance reminder error:", error.message);
  }
};

// Run the reminder check every day at midnight
const startMaintenanceReminderJob = (io) => {

  // Run once immediately when the server starts
  checkMaintenanceReminders(io);

  // Run automatically every day at midnight
  cron.schedule(
    "0 0 * * *",
    () => checkMaintenanceReminders(io),
    {
      timezone: "Asia/Kolkata"
    }
  );

  console.log("Maintenance reminder job scheduled successfully!");
};
module.exports = {
  checkMaintenanceReminders,
  startMaintenanceReminderJob
};
