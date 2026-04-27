import { Router } from "express";
import {
  getNotifications,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware("ADMIN"), getNotifications);
router.post("/read", authMiddleware, roleMiddleware("ADMIN"), markNotificationRead);
router.get("/my", authMiddleware, roleMiddleware("EMPLOYEE"), getMyNotifications);
router.patch("/:id/read", authMiddleware, roleMiddleware("EMPLOYEE"), markNotificationAsRead);
router.patch("/read-all", authMiddleware, roleMiddleware("EMPLOYEE"), markAllNotificationsAsRead);

export default router;
