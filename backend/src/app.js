import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import checkInRoutes from "./routes/checkInRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/checkins", checkInRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "API running" });
});

export default app;
