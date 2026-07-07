"use strict";
import { Router } from "express";
import {
  elegirPlanPreferencia,
  oficializarMatricula,
  matricularNuevoAlumno,
  editarAlumno,
  autoRegistroAlumno,
  asignarSedeMasiva,
  getAlumnos,
  resetPasswordAlumno,
  eliminarAlumnosMasivo
} from "../controllers/alumno.controller.js";
//import { obtenerEstadoMatriculaService } from "../services/alumno.service.js";
import {
  authMiddleware,
  isAdminOrSecretaria,
} from "../middleware/auth.middleware.js";
import { validateSchema } from "../middleware/validation.middleware.js";
import { asignarSedeMasivaAlumnos } from "../controllers/secretaria.controller.js";
import { asignarSedeMasivaIdsSchema } from "../validations/secretaria.validation.js";

const router = Router();

// Matricular nuevo alumno (sin autenticación requerida para testing)
// POST /api/alumnos/registro/nuevo
router.post("/registro/nuevo", matricularNuevoAlumno);
// Obtener todos los alumnos
// GET /api/alumnos
router.get("/", authMiddleware, isAdminOrSecretaria, getAlumnos);
// Auto-registro de alumno (sin autenticación)
// POST /api/alumnos/registro/auto
router.post("/registro/auto", autoRegistroAlumno);

router.delete("/eliminar", authMiddleware, isAdminOrSecretaria, eliminarAlumnosMasivo);

// El alumno elige su preferencia
// POST /api/alumnos/preferencia
router.post("/preferencia", authMiddleware, elegirPlanPreferencia);

// La secretaría oficializa la matrícula
// POST /api/alumnos/matricular
router.post("/matricular", authMiddleware, isAdminOrSecretaria, oficializarMatricula);

//ruta para asignar sedes masivamente a alumnos POST /api/alumnos/sede-alumno
router.put("/sede-alumno", authMiddleware, isAdminOrSecretaria, validateSchema(asignarSedeMasivaIdsSchema), asignarSedeMasivaAlumnos);

// Editar alumno
// PUT /api/alumnos/:id
router.put("/:id", editarAlumno);
// Agrega esta línea junto a tus otras rutas PUT
router.put("/reset-password/:id", authMiddleware, isAdminOrSecretaria, resetPasswordAlumno);

export default router;
