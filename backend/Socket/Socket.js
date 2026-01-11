import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {};

// Correct function to get receiver socketId
export const getReciverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  // Assuming userId sent via query params in handshake
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User connected: userId = ${userId}, SocketId = ${socket.id}`);
  }

  // Emit updated online users list to all clients
  io.emit("getonlineUsers", Object.keys(userSocketMap));

  // Listen for client sending a message to forward it to the receiver
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

export { io, server, app };
