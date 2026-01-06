import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["like", "comment", "follow", "other"], // आपकी ज़रूरत के हिसाब से बढ़ा सकते हैं
  },
  userId: { // जिसने notification ट्रिगर किया है (जैसे जो पोस्ट लाइक किया)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userdetails: {
    username: String,
    profilePicture: String,
  },
  postId: { // अगर ये पोस्ट से जुड़ा है
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
