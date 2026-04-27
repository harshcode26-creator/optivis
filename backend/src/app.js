import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import checkInRoutes from "./routes/checkInRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";
import { getInsights } from "./controllers/checkInController.js";
import authMiddleware from "./middleware/authMiddleware.js";
import roleMiddleware from "./middleware/roleMiddleware.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/checkins", checkInRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);
app.get("/api/insights", authMiddleware, roleMiddleware("ADMIN"), getInsights);

app.get("/api/health", (req, res) => {
  res.json({ message: "API running" });
});

app.get("/", (req, res) => {
  res.send("Optivis API is running 🚀");
});

export default app;
