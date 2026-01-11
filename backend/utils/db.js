import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    if (!process.env.MONGO_URI) {
      return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
  }
};

mongoose.connection.on("disconnected", () => {
  isConnected = false;
});

mongoose.connection.on("error", (err) => {
  isConnected = false;
  console.error("MongoDB Connection Error:", err.message);
});

export default connectDB;
