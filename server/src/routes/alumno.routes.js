"use strict";
import { Router } from "express";
import {
  elegirPlanPreferencia,
  oficializarMatricula,
  matricularNuevoAlumno,
  editarAlumno,
  autoRegistroAlumno,
  asignarSedeMasiva,
} from "../controllers/alumno.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";

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

// POST /api/alumnos/matricular
router.post("/matricular", authMiddleware, oficializarMatricula);

export default router;
