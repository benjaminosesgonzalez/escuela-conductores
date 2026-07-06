import { Router } from "express";
import {
  generarBloques,
  obtenerDisponibilidades,
  obtenerDisponibilidadesPorDiaController,
  actualizarDisponibilidadBloque,
  actualizarMultiples,
  obtenerProfesoresDisponiblesController,
  obtenerConfiguracion,
} from "../controllers/disponibilidad.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Rutas protegidas (requieren autenticación)

/**
<<<<<<< Updated upstream
 * POST /api/disponibilidades/:profesorId/generar
 * Generar bloques de disponibilidad para un profesor
 * Body: { horaInicio?, horaFin?, intervaloMinutos?, diasLaboral? }
 */
router.post("/:profesorId/generar", authMiddleware, generarBloques);

/**
 * GET /api/disponibilidades/:profesorId
 * Obtener todas las disponibilidades de un profesor (agrupadas por día)
 */
router.get("/:profesorId", authMiddleware, obtenerDisponibilidades);

/**
 * GET /api/disponibilidades/:profesorId/dia
 * Obtener disponibilidades de un día específico
 * Query: ?dia=lunes
 */
router.get("/:profesorId/dia", authMiddleware, obtenerDisponibilidadesPorDiaController);

/**
 * GET /api/disponibilidades/:profesorId/configuracion
 * Obtener configuración de horario del profesor
 */
router.get("/:profesorId/configuracion", authMiddleware, obtenerConfiguracion);
=======
 * PATCH /api/disponibilidades/actualizar-multiples
 * Actualizar múltiples bloques a la vez
 * Body: { ids: [1, 2, 3], disponible: true } o { bloques: [{id, disponible}, ...] }
 */
router.patch("/actualizar-multiples", authMiddleware, actualizarMultiples);
>>>>>>> Stashed changes

/**
 * PATCH /api/disponibilidades/bloque/:bloqueId
 * Actualizar disponibilidad de un bloque específico
 * Body: { disponible: boolean }
 */
router.patch("/bloque/:bloqueId", authMiddleware, actualizarDisponibilidadBloque);

/**
<<<<<<< Updated upstream
 * PATCH /api/disponibilidades/actualizar-multiples
 * Actualizar múltiples bloques a la vez
 * Body: { ids: [1, 2, 3], disponible: true }
 */
router.patch("/actualizar-multiples", authMiddleware, actualizarMultiples);

/**
=======
>>>>>>> Stashed changes
 * GET /api/disponibilidades/publico/profesores-disponibles
 * Obtener profesores disponibles (para alumnos)
 * Query: ?dia=lunes&horaInicio=09:00&horaFin=10:30
 */
router.get("/publico/profesores-disponibles", obtenerProfesoresDisponiblesController);

<<<<<<< Updated upstream
=======
/**
 * POST /api/disponibilidades/:profesorId/generar
 * Generar bloques de disponibilidad para un profesor
 * Body: { horaInicio?, horaFin?, intervaloMinutos?, diasLaboral? }
 */
router.post("/:profesorId/generar", authMiddleware, generarBloques);

/**
 * GET /api/disponibilidades/:profesorId/configuracion
 * Obtener configuración de horario del profesor
 */
router.get("/:profesorId/configuracion", authMiddleware, obtenerConfiguracion);

/**
 * GET /api/disponibilidades/:profesorId/dia
 * Obtener disponibilidades de un día específico
 * Query: ?dia=lunes
 */
router.get("/:profesorId/dia", authMiddleware, obtenerDisponibilidadesPorDiaController);

/**
 * GET /api/disponibilidades/:profesorId
 * Obtener todas las disponibilidades de un profesor (agrupadas por día)
 */
router.get("/:profesorId", authMiddleware, obtenerDisponibilidades);

>>>>>>> Stashed changes
export default router;
