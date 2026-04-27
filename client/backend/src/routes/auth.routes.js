import { Router } from "express";
import {
  login,
  register,
  registerStaff,
} from "../controllers/auth.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/register-staff", authMiddleware, isAdmin, registerStaff);

export default router;
