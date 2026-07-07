"use strict";
import { Router } from "express";
import {
  elegirPlanPreferencia,
  oficializarMatricula,
  matricularNuevoAlumno,
  editarAlumno,
  autoRegistroAlumno,
  asignarSedeMasiva
} from "../controllers/alumno.controller.js";
import { authMiddleware, isAdmin, isAdminOrSecretaria } from "../middleware/auth.middleware.js";

const router = Router();

// Matricular nuevo alumno (solo secretaria/admin)
// POST /api/alumnos/registro/nuevo
router.post("/registro/nuevo", authMiddleware, isAdminOrSecretaria, matricularNuevoAlumno);

// Auto-registro de alumno (solo secretaria/admin)
// POST /api/alumnos/registro/auto
router.post("/registro/auto", authMiddleware, isAdminOrSecretaria, autoRegistroAlumno);

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

export default router;
