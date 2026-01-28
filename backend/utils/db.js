import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not defined in environment");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    isConnected = false;
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  isConnected = false;
  console.error("MongoDB Connection Error:", err.message);
});

export default connectDB;
