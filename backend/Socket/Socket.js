import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://instagram-clone-bnpm-git-main-gitrizwan-webs-projects.vercel.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = new Map();

const getReciverSocketId = (receiverId) => userSocketMap.get(receiverId);

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap.set(userId, socket.id);
  }

  io.emit("getonlineUsers", Array.from(userSocketMap.keys()));

  socket.on("sendMessage", (newMessage) => {
    const receiverSocketId = userSocketMap.get(newMessage.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      userSocketMap.delete(userId);
    }
    io.emit("getonlineUsers", Array.from(userSocketMap.keys()));
  });
});

// Start server function to use when running standalone
const startServer = (port = 4000) => {
  server.listen(port, () => {
    console.log(`Socket.io server running on port ${port}`);
  });
};

export { io, server, startServer, getReciverSocketId };
