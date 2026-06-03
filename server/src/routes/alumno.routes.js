"use strict";
import { Router } from "express";
import {
  elegirPlanPreferencia,
  oficializarMatricula,
  matricularNuevoAlumno,
  editarAlumno,
  editarMiPerfil
} from "../controllers/alumno.controller.js";
import { authMiddleware, isAdmin, isAdminOrSecretaria } from "../middleware/auth.middleware.js";

const router = Router();

//ruta alumno editando sus datos
router.put("/mi-perfil", authMiddleware, editarMiPerfil);

// El alumno elige su preferencia POST /api/alumnos/preferencia
router.post("/preferencia", authMiddleware, elegirPlanPreferencia);

// La secretaría oficializa la matrícula POST /api/alumnos/matricular
router.post("/matricular", authMiddleware, isAdminOrSecretaria, oficializarMatricula);

//Admin y secretaria pueden registrar y matricular altiro un nuevo alumno POST /api/alumnos/registrar
router.post("/registrar", authMiddleware, isAdminOrSecretaria, matricularNuevoAlumno);

//admin y secretaria pueden editar datos del alumno PUT /api/alumnos/editar
router.put("/editar/:id", authMiddleware, isAdminOrSecretaria, editarAlumno);

export default router;
