import mongoose from "mongoose";

const { Schema } = mongoose;

const workspaceSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  joinCode: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

workspaceSchema.pre("save", function () {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-");
  }

  if (!this.joinCode) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    this.joinCode = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  }
});

const Workspace = mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);

export default Workspace;
