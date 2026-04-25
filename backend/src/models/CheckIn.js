import mongoose from "mongoose";

const { Schema } = mongoose;

const checkInSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  period: {
    type: String,
    enum: ["WEEKLY", "MONTHLY"],
  },
  questions: [
    {
      type: String,
      trim: true,
    },
  ],
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CheckIn = mongoose.models.CheckIn || mongoose.model("CheckIn", checkInSchema);

export default CheckIn;
