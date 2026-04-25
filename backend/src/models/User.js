import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["ADMIN", "EMPLOYEE"],
  },
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const bcrypt = await import("bcrypt");
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (password) {
  const bcrypt = await import("bcrypt");
  return bcrypt.compare(password, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
