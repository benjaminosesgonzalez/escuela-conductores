import { Router } from "express";
import {
  obtener_archivos_profesor,
  asignar_material_a_clases,
  obtener_materiales_clase,
  eliminar_material_clase,
} from "../controllers/clase-material.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/:profesorId/archivos", authMiddleware, obtener_archivos_profesor);
router.post("/asignar", authMiddleware, asignar_material_a_clases);
router.get("/:claseId/materiales", obtener_materiales_clase);
router.delete("/eliminar", authMiddleware, eliminar_material_clase);

export default router;
