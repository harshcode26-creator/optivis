import { Router } from "express";
import {
  getAssignmentDetails,
  getInsights,
  getMyAssignmentDetails,
  getMyAssignments,
  getSubmittedAssignments,
  reviewAssignment,
  submitCheckIn,
} from "../controllers/checkInController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/my", authMiddleware, roleMiddleware("EMPLOYEE"), getMyAssignments);
router.get("/my/:assignmentId", authMiddleware, roleMiddleware("EMPLOYEE"), getMyAssignmentDetails);
router.get("/insights", authMiddleware, roleMiddleware("ADMIN"), getInsights);
router.get("/submitted", authMiddleware, roleMiddleware("ADMIN"), getSubmittedAssignments);
router.get("/:assignmentId", authMiddleware, roleMiddleware("ADMIN", "EMPLOYEE"), getAssignmentDetails);
router.post("/review", authMiddleware, roleMiddleware("ADMIN"), reviewAssignment);
router.post("/submit", authMiddleware, roleMiddleware("EMPLOYEE"), submitCheckIn);

export default router;
