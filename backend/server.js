// server.js (Express ऐप)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";

dotenv.config();

import postRoutes from "./Routes/post.routes.js";
import messageRoutes from "./Routes/meassage.route.js";
import userRoutes from "./Routes/user.routes.js";

const app = express();

const ensureDBConnection = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("DB connection error:", error.message);
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
  "https://instagram-clone-bnpm.vercel.app",
  "https://instagram-clone-1rz5pm16k-gitrizwan-webs-projects.vercel.app",
  /^https:\/\/instagram-clone.*\.vercel\.app$/,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) =>
        typeof allowed === "string" ? allowed === origin : allowed.test(origin)
      );
      callback(null, isAllowed || process.env.NODE_ENV === "development");
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,
  })
);

app.use("/api", async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/message", messageRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Instagram Clone API is running",
    environment: process.env.VERCEL ? "vercel" : "local",
  });
});

app.get("/health", async (req, res) => {
  try {
    const mongoose = (await import("mongoose")).default;
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.status(200).json({
      success: true,
      message: "Backend running",
      database: dbStatus,
      environment: process.env.VERCEL ? "vercel" : "local",
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      message: "Backend running",
      database: "unknown",
      error: error.message,
    });
  }
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

const PORT = process.env.PORT || 5000;
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
