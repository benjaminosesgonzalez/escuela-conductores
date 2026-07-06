"use strict";
import { Router } from "express";
import {
  elegirPlanPreferencia,
  oficializarMatricula,
  matricularNuevoAlumno,
  editarAlumno,
  editarMiPerfil,
  autoRegistroAlumno,
  asignarSedeMasiva
} from "../controllers/alumno.controller.js";
import { obtenerEstadoMatriculaService } from "../services/alumno.service.js";
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

// Auto-registro de alumno (sin autenticación)
// POST /api/alumnos/registro/auto
router.post("/registro/auto", autoRegistroAlumno);

// Editar alumno
// PUT /api/alumnos/:id
router.put("/:id", editarAlumno);

// Asignar sede masiva
// POST /api/alumnos/asignar-sede-masiva
router.post("/asignar-sede-masiva", asignarSedeMasiva);

// El alumno elige su preferencia
// POST /api/alumnos/preferencia
router.post("/preferencia", authMiddleware, elegirPlanPreferencia);

// La secretaría oficializa la matrícula
// POST /api/alumnos/matricular
router.post("/matricular", authMiddleware, isAdmin, oficializarMatricula);

//ruta para asignar sedes masivamente a alumnos
router.put("/sede-alumno", authMiddleware, isAdminOrSecretaria, validateSchema(asignarSedeMasivaIdsSchema), asignarSedeMasivaAlumnos);


export default router;
