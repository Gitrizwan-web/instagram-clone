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

/* Proper __dirname for ES Modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/* Health Check */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend running",
  });
});

/* Serve Frontend (Vite build) */
app.use(
  express.static(path.join(__dirname, "..", "frontend", "dist"))
);

/* EXPRESS 5 CATCH-ALL (REGEX — REQUIRED) */
app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "frontend", "dist", "index.html")
  );
});

/* Server */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
