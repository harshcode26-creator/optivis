import { Router } from "express";
import { createCheckIn } from "../controllers/checkInController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/create", authMiddleware, roleMiddleware("ADMIN"), createCheckIn);

export default router;
