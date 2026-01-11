import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
let io = null;

const userSocketMap = {};

// Initialize Socket.IO only if not on Vercel
// Vercel serverless functions don't support WebSockets
// Use a function to initialize lazily instead of top-level async
const initializeSocketIO = async () => {
  if (process.env.VERCEL === "1") {
    console.log("ℹ️ Running on Vercel - Socket.IO disabled (serverless limitation)");
    return;
  }

  try {
    const { Server } = await import("socket.io");
    
    io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId;

      if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`User connected: userId = ${userId}, SocketId = ${socket.id}`);
      }

      io.emit("getonlineUsers", Object.keys(userSocketMap));

      socket.on("sendMessage", (newMessage) => {
        const receiverSocketId = userSocketMap[newMessage.receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", newMessage);
        }
      });

      socket.on("disconnect", () => {
        if (userId) {
          delete userSocketMap[userId];
          io.emit("getonlineUsers", Object.keys(userSocketMap));
          console.log(`User disconnected: userId = ${userId}`);
        }
      });
    });
    
    console.log("✅ Socket.IO initialized");
  } catch (error) {
    console.warn("⚠️ Socket.IO initialization failed:", error.message);
  }
};

// Only initialize if not on Vercel (non-blocking for serverless)
if (process.env.VERCEL !== "1") {
  // Don't await - let it initialize in background
  initializeSocketIO().catch(err => {
    console.warn("Socket.IO init error:", err.message);
  });
}

// Correct function to get receiver socketId
export const getReciverSocketId = (receiverId) => userSocketMap[receiverId] || null;

// Export io (will be null on Vercel)
export { io, server, app };
