import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "../../utils/db.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://instagram-clone-bnpm-git-main-gitrizwan-webs-projects.vercel.app",
  process.env.CLIENT_URL,
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Define routes here
app.get("/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

export default app;
