import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./utils/db.js";
import userRoutes from "./Routes/user.routes.js";
import postRoutes from "./Routes/post.routes.js";
import messageRoutes from "./Routes/meassage.route.js";

import { Server } from "socket.io";

dotenv.config();

/* -------------------- APP + SERVER -------------------- */

const app = express();
const server = http.createServer(app);

/* -------------------- SOCKET.IO -------------------- */

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://instagram-clone-bnpm-git-main-gitrizwan-webs-projects.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getonlineUsers", Object.keys(userSocketMap));

  socket.on("sendMessage", (newMessage) => {
    const receiverSocketId = userSocketMap[newMessage.receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
  });

  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
    io.emit("getonlineUsers", Object.keys(userSocketMap));
  });
});

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://instagram-clone-bnpm-git-main-gitrizwan-webs-projects.vercel.app",
    ],
    credentials: true,
  })
);

/* -------------------- ROUTES -------------------- */

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/message", messageRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend running (Fly.io)",
  });
});

/* -------------------- START SERVER -------------------- */

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log("🚀 Server running on port", PORT);
    });
  } catch (error) {
    console.error("Server start error:", error.message);
  }
};

startServer();
