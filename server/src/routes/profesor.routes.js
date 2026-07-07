import { Router } from "express";
import {
  registrarProfesor,
  getProfesores,
  updateProfesor,
  deleteProfesor,
} from "../controllers/profesor.controller.js";
import {
  authMiddleware,
  isAdmin,
  isAdminOrSecretaria,
} from "../middleware/auth.middleware.js";

const router = Router();

// Registro de profesor (solo admin autorizado)
router.post("/registro", authMiddleware, isAdmin, registrarProfesor);

// Resto de rutas protegidas: admin o secretaria
router.use(authMiddleware, isAdminOrSecretaria);

router.get("/", getProfesores);
router.put("/:id", updateProfesor);
router.delete("/:id", deleteProfesor);

export default router;
