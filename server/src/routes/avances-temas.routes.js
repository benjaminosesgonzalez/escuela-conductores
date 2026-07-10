import { Router } from "express";
import {
  generar_avances_alumno,
  obtener_instancias_del_dia,
  obtener_alumnos_inscritos,
  registrar_asistencia,
  verificar_puede_reservar,
  obtener_clases_completadas,
  crear_avances_masivos,
  completar_primeros_temas,
} from "../controllers/avances-temas.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/:id/generar", authMiddleware, generar_avances_alumno);
router.get("/instancias/del-dia", authMiddleware, obtener_instancias_del_dia);
router.get("/:id/alumnos-inscritos", authMiddleware, obtener_alumnos_inscritos);
router.post("/:id/registrar-asistencia", authMiddleware, registrar_asistencia);
router.get("/:id/puede-reservar", verificar_puede_reservar);
router.get("/:id/clases-completadas", authMiddleware, obtener_clases_completadas);
router.post("/crear/masivos", crear_avances_masivos);
router.post("/completar/primeros", completar_primeros_temas);

export default router;
