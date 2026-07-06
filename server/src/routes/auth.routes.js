import { Router } from "express";
import {
  login,
  registerStaff,
} from "../controllers/auth.controller.js";
import { authMiddleware, isAdminOrSecretaria } from "../middleware/auth.middleware.js";
import { autoRegistroAlumno } from "../controllers/alumno.controller.js"; 

const router = Router();

router.post("/login", login);
router.post("/register", autoRegistroAlumno);
router.post(
  "/register-staff",
  authMiddleware,
  isAdminOrSecretaria,
  registerStaff,
);

export default router;
