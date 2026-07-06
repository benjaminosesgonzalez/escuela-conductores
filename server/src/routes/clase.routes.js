import { Router } from "express";
import {
  obtenerAlumnosParaAgendar,
  obtenerProfesoresDisponiblesCtrl,
  crearClase,
  obtenerClasesAlumno,
} from "../controllers/clase.controller.js";

const router = Router();

// GET alumnos con disponibilidades seleccionadas
router.get("/alumnos-para-agendar", obtenerAlumnosParaAgendar);

// GET profesores disponibles para un horario
router.get("/profesores-disponibles", obtenerProfesoresDisponiblesCtrl);

// GET clases de un alumno
router.get("/:alumnoId", obtenerClasesAlumno);

// POST crear una clase
router.post("/", crearClase);

export default router;
