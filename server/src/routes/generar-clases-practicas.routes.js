import { Router } from "express";
import {
  generarClasesPracticasProfesor,
  generarTodasClasesPracticas,
} from "../controllers/generar-clases-practicas.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Generar clases prácticas para un profesor específico
router.post(
  "/profesor/:profesorId",
  authMiddleware,
  generarClasesPracticasProfesor
);

// Generar TODAS las clases prácticas para todos los profesores
router.post("/generar/todas", authMiddleware, generarTodasClasesPracticas);

export default router;
