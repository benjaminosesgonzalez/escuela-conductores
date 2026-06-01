"use strict";
import { Router } from "express";
import {
  elegirPlanPreferencia,
  oficializarMatricula,
  matricularNuevoAlumno,
} from "../controllers/alumno.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// El alumno elige su preferencia POST /api/alumnos/preferencia
router.post("/preferencia", authMiddleware, elegirPlanPreferencia);

// La secretaría oficializa la matrícula POST /api/alumnos/matricular
router.post("/matricular", authMiddleware, isAdmin, oficializarMatricula);

//Admin y secretaria pueden registrar y matricular altiro un nuevo alumno POST /api/alumnos/registrar
router.post("/registrar", authMiddleware, isAdmin, matricularNuevoAlumno);

export default router;
