import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  try {
    if (isConnected) {
      return;
    }

    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI not found in environment variables");
      return;
    }

    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    isConnected = true;
    console.log("✅ MongoDB connected:", conn.connection.host);

  } catch (error) {
    isConnected = false;
    console.error("❌ MongoDB connection failed:", error.message);
  }
};

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  isConnected = false;
  console.error("❌ MongoDB error:", err.message);
});

export default connectDB;
