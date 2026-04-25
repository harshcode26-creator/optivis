import mongoose from "mongoose";

const { Schema } = mongoose;

const answerSchema = new Schema({
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
  },
  question: {
    type: String,
    trim: true,
  },
  answer: {
    type: String,
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Answer = mongoose.models.Answer || mongoose.model("Answer", answerSchema);

export default Answer;
