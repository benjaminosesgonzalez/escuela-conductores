import { Router } from "express";
import {
  login,
  registerStaff,
} from "../controllers/auth.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";
import { autoRegistroAlumno } from "../controllers/alumno.controller.js"; 

const router = Router();
 
router.post("/login", login);
router.post("/register-staff", authMiddleware, isAdmin, registerStaff);
router.post("/register", autoRegistroAlumno);
export default router;
 