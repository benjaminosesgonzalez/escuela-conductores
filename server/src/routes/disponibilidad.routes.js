import { Router } from "express";
import {
  generarBloques,
  obtenerDisponibilidades,
  obtenerDisponibilidadesPorDiaController,
  actualizarDisponibilidadBloque,
  actualizarMultiples,
  obtenerProfesoresDisponiblesController,
  obtenerConfiguracion,
  regenerarBloquesController,
  regenerarTodosBloquesController,
} from "../controllers/disponibilidad.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Rutas protegidas (requieren autenticación)

/**
 * POST /api/disponibilidades/regenerar-todos
 * Regenerar bloques para TODOS los profesores
 */
router.post("/regenerar-todos", authMiddleware, regenerarTodosBloquesController);

/**
 * POST /api/disponibilidades/:profesorId/regenerar
 * Regenerar bloques para un profesor específico
 */
router.post("/:profesorId/regenerar", authMiddleware, regenerarBloquesController);

/**
 * PATCH /api/disponibilidades/actualizar-multiples
 * Actualizar múltiples bloques a la vez
 * Body: { ids: [1, 2, 3], disponible: true } o { bloques: [{id, disponible}, ...] }
 */
router.patch("/actualizar-multiples", authMiddleware, actualizarMultiples);

/**
 * PATCH /api/disponibilidades/bloque/:bloqueId
 * Actualizar disponibilidad de un bloque específico
 * Body: { disponible: boolean }
 */
router.patch("/bloque/:bloqueId", authMiddleware, actualizarDisponibilidadBloque);

/**
 * GET /api/disponibilidades/publico/profesores-disponibles
 * Obtener profesores disponibles (para alumnos)
 * Query: ?dia=lunes&horaInicio=09:00&horaFin=10:30
 */
router.get("/publico/profesores-disponibles", obtenerProfesoresDisponiblesController);

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

export default router;
