import { Router } from "express";
import {
  generarBloquesAlumno,
  obtenerDisponibilidadesAlumno,
  obtenerDisponibilidadesAlumnoPorDia,
  actualizarDisponibilidadAlumnoBloque,
  actualizarMultiplesDisponibilidadesAlumno,
  obtenerDisponibilidadesAlumnoDisponibles,
} from "../controllers/disponibilidad-alumno.controller.js";

const router = Router();

// Rutas específicas ANTES de rutas dinámicas
// Actualizar un bloque específico
// PATCH /api/disponibilidades-alumnos/bloque/:bloqueId
router.patch("/bloque/:bloqueId", actualizarDisponibilidadAlumnoBloque);

// Actualizar múltiples disponibilidades
// PATCH /api/disponibilidades-alumnos/actualizar-multiples
router.patch("/actualizar-multiples", actualizarMultiplesDisponibilidadesAlumno);

// Rutas dinámicas
// Generar bloques de disponibilidad para un alumno
// POST /api/disponibilidades-alumnos/:alumnoId/generar
router.post("/:alumnoId/generar", generarBloquesAlumno);

// Obtener disponibilidades de un alumno por día específico
// GET /api/disponibilidades-alumnos/:alumnoId/dia?dia=lunes
router.get("/:alumnoId/dia", obtenerDisponibilidadesAlumnoPorDia);

// Obtener disponibilidades disponibles (para secretaria)
// GET /api/disponibilidades-alumnos/:alumnoId/disponibles?dia=lunes&horaInicio=09:00&horaFin=17:00
router.get("/:alumnoId/disponibles", obtenerDisponibilidadesAlumnoDisponibles);

// Obtener disponibilidades de un alumno
// GET /api/disponibilidades-alumnos/:alumnoId
router.get("/:alumnoId", obtenerDisponibilidadesAlumno);

export default router;
