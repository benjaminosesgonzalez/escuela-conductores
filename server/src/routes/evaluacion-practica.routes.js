import { Router } from "express";
import {
  obtener_criterios,
  obtener_clases_practicas_profesor,
  crear_evaluacion,
  agregar_criterio,
  obtener_criterios_evaluacion,
  terminar_evaluacion,
  obtener_historial_profesor,
} from "../controllers/evaluacion-practica.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Obtener criterios de evaluación (públicos)
router.get("/criterios", obtener_criterios);

// Obtener clases prácticas del profesor
router.get(
  "/profesor/:profesorId/clases-practicas",
  authMiddleware,
  obtener_clases_practicas_profesor
);

// Crear nueva evaluación
router.post("/", authMiddleware, crear_evaluacion);

// Agregar criterio a evaluación
router.post("/agregar-criterio", authMiddleware, agregar_criterio);

// Obtener criterios de una evaluación
router.get("/:evaluacionId/criterios", obtener_criterios_evaluacion);

// Terminar evaluación
router.post("/:evaluacionId/terminar", authMiddleware, terminar_evaluacion);

// Obtener historial de evaluaciones del profesor
router.get(
  "/profesor/:profesorId/historial",
  authMiddleware,
  obtener_historial_profesor
);

export default router;
