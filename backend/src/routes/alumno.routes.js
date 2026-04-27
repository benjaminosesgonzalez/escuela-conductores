"use strict";
import { Router } from "express";
import {
  elegirPlanPreferencia,
  oficializarMatricula,
} from "../controllers/alumno.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// El alumno elige su preferencia POST /api/alumnos/preferencia
router.post("/preferencia", authMiddleware, elegirPlanPreferencia);

// La secretaría oficializa la matrícula POST /api/alumnos/matricular
router.post("/matricular", authMiddleware, isAdmin, oficializarMatricula);

export default router;
