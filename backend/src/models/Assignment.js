import mongoose from "mongoose";

const { Schema } = mongoose;

const assignmentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  checkInId: {
    type: Schema.Types.ObjectId,
    ref: "CheckIn",
  },
  workspaceId: {
    type: Schema.Types.ObjectId,
  },
  status: {
    type: String,
    enum: ["PENDING", "PARTIAL", "SUBMITTED"],
  },
  reviewStatus: {
    type: String,
    enum: ["PENDING", "REVIEWED"],
  },
  submittedAt: {
    type: Date,
  },
  reviewedAt: {
    type: Date,
  },
  adminComment: {
    type: String,
    trim: true,
  },
  sentimentScore: {
    type: Number,
  },
  blockerTags: [
    {
      type: String,
      trim: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Assignment = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);

export default Assignment;
