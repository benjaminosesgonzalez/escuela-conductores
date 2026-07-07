import { Router } from "express";
import {
  generarClasesOnline,
  obtenerMisClasesOnline,
  generarLinkZoom,
  obtenerClasesDisponibles,
} from "../controllers/clase-online.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Generar clases online basadas en disponibilidad
// POST /api/clases-online/:profesorId/generar
router.post("/:profesorId/generar", authMiddleware, generarClasesOnline);

// Obtener clases online del profesor
// GET /api/clases-online/:profesorId
router.get("/:profesorId", authMiddleware, obtenerMisClasesOnline);

// Obtener clases disponibles por día
// GET /api/clases-online/:profesorId/disponibles?diaSemana=lunes
router.get("/:profesorId/disponibles", authMiddleware, obtenerClasesDisponibles);

// Actualizar link Zoom de una clase
// PATCH /api/clases-online/:claseOnlineId/zoom
router.patch("/:claseOnlineId/zoom", authMiddleware, generarLinkZoom);

export default router;
