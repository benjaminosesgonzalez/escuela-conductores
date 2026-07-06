import { Router } from "express";
import {
  getProfesores,
  updateProfesor,
  deleteProfesor,
} from "../controllers/profesor.controller.js";
import {
  authMiddleware,
  isAdminOrSecretaria,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware, isAdminOrSecretaria);

router.get("/", getProfesores);
router.put("/:id", updateProfesor);
router.delete("/:id", deleteProfesor);

export default router;
