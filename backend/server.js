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
connectDB();



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
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend running",
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
