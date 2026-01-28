import { Server } from "socket.io";

let io;

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO");

    io = new Server(res.socket.server, {
      path: "/api/socket_io",
      cors: {
        origin: [
          "https://instagram-clone-bnpm-git-main-gitrizwan-webs-projects.vercel.app",
          "http://localhost:5173",
          process.env.CLIENT_URL,
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["polling"],  // Important for Vercel
    });

    const userSocketMap = {};

    io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId;
      if (userId) userSocketMap[userId] = socket.id;

      io.emit("getonlineUsers", Object.keys(userSocketMap));

      socket.on("sendMessage", (newMessage) => {
        const receiverSocketId = userSocketMap[newMessage.receiverId];
        if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);
      });

      socket.on("disconnect", () => {
        if (userId) delete userSocketMap[userId];
        io.emit("getonlineUsers", Object.keys(userSocketMap));
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
