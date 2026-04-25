import { Router } from "express";
import { createWorkspace, joinWorkspace, login } from "../controllers/authController.js";

const router = Router();

router.post("/create-workspace", createWorkspace);
router.post("/join", joinWorkspace);
router.post("/login", login);

export default router;
