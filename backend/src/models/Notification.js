import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
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

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
