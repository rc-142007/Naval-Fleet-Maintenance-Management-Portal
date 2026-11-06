
const dns = require("node:dns");

// Use Google DNS for Node.js DNS lookups
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// 1. Import required packages
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

// 2. Load environment variables
dotenv.config();

// 3. Import database connection
const connectDB = require("./config/db");

// 4. Import models
const User = require("./models/User");

// 5. Import routes
const authRoutes = require("./routes/authRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");
const problemRoutes = require("./routes/problemRoutes");
const repairRoutes = require("./routes/repairRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");

// 6. Import maintenance reminder service
const {
  startMaintenanceReminderJob
} = require("./services/maintenanceReminderService");

// 7. Create Express application
const app = express();

// 8. Create HTTP server
const server = http.createServer(app);

// 9. Configure allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL
].filter(Boolean);

// 10. Configure Express CORS
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

// Handle JSON requests
app.use(express.json());

// 11. Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }
});

// 12. Authenticate Socket.IO connections
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return next(new Error("Invalid or inactive user"));
    }

    socket.userId = user._id.toString();

    next();

  } catch (error) {
    console.error("Socket authentication error:", error.message);
    next(new Error("Socket authentication failed"));
  }
});

// 13. Join private notification rooms
io.on("connection", (socket) => {

  socket.join(`user_${socket.userId}`);

  console.log(
    `User connected to notifications: ${socket.userId}`
  );

  socket.on("disconnect", () => {
    console.log(
      `User disconnected: ${socket.userId}`
    );
  });

});

// 14. Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

// 15. Make Socket.IO available to API routes
app.set("io", io);

// 16. Backend test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NFMMP Backend Server is Running!"
  });
});

// 17. Server port
const PORT = process.env.PORT || 5000;

// 18. Start server after database connection
const startServer = async () => {
  try {

    await connectDB();

    // Start automated maintenance reminders
    startMaintenanceReminderJob(io);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`NFMMP Server running on port ${PORT}`);
      console.log("Allowed frontend origins:", allowedOrigins);
    });

  } catch (error) {

    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
