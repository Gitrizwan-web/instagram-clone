import express from "express";
import http from "http";

const app = express();
let server = null;
let io = null;

const userSocketMap = {};

if (process.env.VERCEL !== "1") {
  server = http.createServer(app);
  
  const initializeSocketIO = async () => {
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
          }
        });
      });
    } catch (error) {
      // Socket.IO initialization failed
    }
  };

  initializeSocketIO().catch(() => {});
} else {
  server = { listen: () => {} };
}

export const getReciverSocketId = (receiverId) => userSocketMap[receiverId] || null;

export { io, server, app };
