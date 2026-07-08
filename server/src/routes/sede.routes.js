import { Router } from "express";
import {
  getSedes,
  createSede,
  updateSede,
  deleteSede,
} from "../controllers/sede.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Público para usuarios logueados (para que alumnos y secretarias las listen)
// GET /api/sedes
router.get("/", authMiddleware, getSedes);

router.post("/", authMiddleware, isAdmin, createSede);
router.put("/:id", authMiddleware, isAdmin, updateSede);
router.delete("/:id", authMiddleware, isAdmin, deleteSede);

export default router;
