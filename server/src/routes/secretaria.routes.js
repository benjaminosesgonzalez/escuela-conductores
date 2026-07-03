import { Router } from "express";
import {
  getSecretarias,
  updateSecretaria,
  deleteSecretaria,
} from "../controllers/secretaria.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Bloqueo total: Solo el Admin entra aquí
router.use(authMiddleware, isAdmin);

router.get("/", getSecretarias);
router.put("/:id", updateSecretaria);
router.delete("/:id", deleteSecretaria);

export default router;
