"use strict";
import { Router } from "express";
import {
  elegirPlanPreferencia,
  oficializarMatricula,
} from "../controllers/alumno.controller.js";
import {
  authMiddleware,
  isAdminOrSecretaria,
} from "../middleware/auth.middleware.js";

const router = Router();

// El alumno elige su preferencia POST /api/alumnos/preferencia
router.post("/preferencia", authMiddleware, elegirPlanPreferencia);

router.get("/estado-matricula", authMiddleware, async (req, res) => {
  const idUser = req.user.id; // Suponiendo que el middleware de autenticación agrega el usuario al objeto req
  try {
    const estado = await obtenerEstadoMatriculaService(idUser);
    res.json({ estado });
  } catch (error) {
    console.error("Error al obtener estado de matrícula:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// La secretaría oficializa la matrícula POST /api/alumnos/matricular
router.post(
  "/matricular",
  authMiddleware,
  isAdminOrSecretaria,
  oficializarMatricula,
);

export default router;
