import { Router } from "express";
import {
    configurarHorarioSala,
    obtenerDisponibilidadSala,
    agendarBloque,
    obtenerMisReservasPsicotecnico

} from "../controllers/agendamiento.controller.js";
import { authMiddleware, isAdminOrSecretaria } from "../middleware/auth.middleware.js";

const router = Router();

// 1. configurar los horarios semanales (exclusivo secretaria o admin)
router.post("/configurar-sala", authMiddleware, isAdminOrSecretaria, configurarHorarioSala);

//2. ver horarios disponibles
router.get("/disponibilidad-sala", authMiddleware, obtenerDisponibilidadSala);

//3. alumno selecciona y reserva su bloque 
router.post("/agendar-bloque", authMiddleware, agendarBloque);

//4 ver mis reservas de las sala psicotecnica
router.get("/mis-reservas-psicotecnico", authMiddleware, obtenerMisReservasPsicotecnico);

export default router;