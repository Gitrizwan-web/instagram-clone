import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  // If already connected, return
  if (isConnected) {
    console.log("✅ MongoDB Already Connected");
    return;
  }

  // If connection is in progress, wait
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    console.log("✅ MongoDB Already Connected");
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      console.warn("⚠️ MONGO_URI not set, skipping database connection");
      return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    // Don't exit process - allow server to continue (important for Vercel)
    // The connection will be retried on next request
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.log("⚠️ MongoDB Disconnected");
});

mongoose.connection.on("error", (err) => {
  isConnected = false;
  console.error("❌ MongoDB Connection Error:", err.message);
});

export default connectDB;
