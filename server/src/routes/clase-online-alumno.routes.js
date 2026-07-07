import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  obtenerClasesDisponibles,
  inscribirse,
  desinscribirse,
  obtenerMisClases,
  verificarMiInscripcion,
} from "../controllers/clase-online-alumno.controller.js";

const router = Router();

// Obtener clases disponibles (público, pero mejor si está autenticado)
router.get("/disponibles", authMiddleware, obtenerClasesDisponibles);

// Mis clases inscritas
router.get("/mis-clases", authMiddleware, obtenerMisClases);

// Verificar si estoy inscrito en una clase específica
router.get("/:claseOnlineId/inscrito", authMiddleware, verificarMiInscripcion);

// Inscribirse en una clase
router.post("/:claseOnlineId/inscribirse", authMiddleware, inscribirse);

// Desinscribirse de una clase
router.delete("/:claseOnlineId/desinscribirse", authMiddleware, desinscribirse);

export default router;
