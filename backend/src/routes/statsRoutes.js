import { Router } from "express";
import { getCheckInStats, getOverviewStats } from "../controllers/statsController.js";

const router = Router();

router.get("/overview", getOverviewStats);
router.get("/checkins", getCheckInStats);

export default router;
