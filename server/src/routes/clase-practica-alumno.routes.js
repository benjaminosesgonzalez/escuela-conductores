import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getClasesPracticasDisponibles,
  enrollClasePractica,
  unenrollClasePractica,
  getMisClasesPracticas,
} from "../controllers/clase-practica-alumno.controller.js";

const router = express.Router();

// GET clases prácticas disponibles
router.get("/disponibles", authMiddleware, getClasesPracticasDisponibles);

// GET mis clases prácticas inscritas
router.get("/mis-clases", authMiddleware, getMisClasesPracticas);

// POST inscribirse en clase práctica
router.post("/:id/inscribirse", authMiddleware, enrollClasePractica);

// DELETE desinscribirse de clase práctica
router.delete("/:id/desinscribirse", authMiddleware, unenrollClasePractica);

export default router;
