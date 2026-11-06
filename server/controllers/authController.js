
const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// 1. GENERATE JWT TOKEN
// ==========================================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
};

// ==========================================
// 2. LOGIN USER
// ==========================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password"
      });
    }

    // Find user by email
    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated"
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

// ==========================================
// 3. CREATE OFFICER / TECHNICIAN ACCOUNT
// ==========================================

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Only Admin can create accounts
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Admin can create accounts"
      });
    }

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Validate role
    if (!["OFFICER", "TECHNICIAN"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Only Officer and Technician accounts can be created"
      });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters"
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create account
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      isActive: true,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Account creation failed",
      error: error.message
    });
  }
};

// ==========================================
// 4. EXPORT CONTROLLERS
// ==========================================

module.exports = {
  loginUser,
  createUser
};
