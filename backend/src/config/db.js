import mongoose from "mongoose";

const connectDB = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  try {
    await mongoose.connect(MONGO_URI);
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

export default connectDB;
