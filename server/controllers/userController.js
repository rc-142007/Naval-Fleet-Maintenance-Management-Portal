const mongoose = require("mongoose");
const User = require("../models/User");

// Get all Officers and Technicians (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["OFFICER", "TECHNICIAN"] }
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active Technicians (Admin and Officer)
const getActiveTechnicians = async (req, res) => {
  try {
    const technicians = await User.find({
      role: "TECHNICIAN",
      isActive: true
    })
      .select("name email role")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      technicians
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Activate or deactivate personnel (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false"
      });
    }

    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ["OFFICER", "TECHNICIAN"] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Personnel not found"
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Personnel ${isActive ? "activated" : "deactivated"} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getActiveTechnicians,
  updateUserStatus
};