import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import postRoutes from "./Routes/post.routes.js";
import messageRoutes from "./Routes/meassage.route.js";
import userRoutes from "./Routes/user.routes.js";
import connectDB from "./utils/db.js";
import { app, server } from "./Socket/Socket.js";

let dbConnectionAttempted = false;

const ensureDBConnection = async () => {a
  if (dbConnectionAttempted) return;
  dbConnectionAttempted = true;
  
  try {
    await connectDB();
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
};
app.use((req, res, next) => {
  if (process.env.VERCEL === "1" && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  
  if (req.path.startsWith("/api/")) {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; connect-src 'self' https:; frame-ancestors 'none';"
    );
  } else {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    );
  }

  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  next();
});

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
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === "string") {
          return allowed === origin;
        } else if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });
      
      if (isAllowed || process.env.NODE_ENV === "development") {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use("/api", (req, res, next) => {
  ensureDBConnection().catch(() => {});
  next();
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/message", messageRoutes);

app.get("/", (req, res) => {
  try {
    ensureDBConnection().catch(() => {});
    
    return res.status(200).json({
      success: true,
      message: "Instagram Clone API is running",
      endpoints: {
        health: "/health",
        user: "/api/v1/user",
        post: "/api/v1/post",
        message: "/api/v1/message"
      },
      environment: process.env.VERCEL ? "vercel" : "local"
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      message: "Instagram Clone API is running",
      endpoints: {
        health: "/health",
        user: "/api/v1/user",
        post: "/api/v1/post",
        message: "/api/v1/message"
      }
    });
  }
});

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

app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== "1" && server && typeof server.listen === "function") {
  try {
    server.listen(PORT);
  } catch (error) {
    console.error("Server startup error:", error.message);
  }
}


export default app;
