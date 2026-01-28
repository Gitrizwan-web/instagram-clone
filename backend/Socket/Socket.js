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

export { io, server }; 
