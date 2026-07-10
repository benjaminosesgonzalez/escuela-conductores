import { Router } from "express";
import {
  registrarSecretaria,
  getSecretarias,
  getSecretariaById,
  updateSecretaria,
  deleteSecretaria,
} from "../controllers/secretaria.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Registro de secretaria (solo admin autorizado)
router.post("/registro", authMiddleware, isAdmin, registrarSecretaria);

// Resto de rutas protegidas: solo admin
router.use(authMiddleware, isAdmin);

router.get("/", getSecretarias);
router.get("/:id", getSecretariaById);
router.put("/:id", updateSecretaria);
router.delete("/:id", deleteSecretaria);

export default router;
