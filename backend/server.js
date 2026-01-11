import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import postRoutes from "./Routes/post.routes.js";
import messageRoutes from "./Routes/meassage.route.js";
import userRoutes from "./Routes/user.routes.js";
import connectDB from "./utils/db.js";
import { app, server } from "./Socket/Socket.js";

dotenv.config();

// Connect to database (non-blocking, won't crash if it fails)
connectDB().catch((error) => {
  console.error("Database connection error:", error);
});



/* Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

/* API Routes */
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/message", messageRoutes);

/* Root Route */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Instagram Clone API is running",
    endpoints: {
      health: "/health",
      user: "/api/v1/user",
      post: "/api/v1/post",
      message: "/api/v1/message"
    }
  });
});

/* Health Check */
app.get("/health", async (req, res) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    
    res.status(200).json({
      success: true,
      message: "Backend running",
      database: dbStatus,
      environment: process.env.VERCEL ? "vercel" : "local"
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      message: "Backend running",
      database: "unknown",
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path
  });
});



/* Server */
const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== "1") {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app for Vercel serverless functions
export default app;
