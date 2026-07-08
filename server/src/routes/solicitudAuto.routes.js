import { Router } from "express";
import {
  crearSolicitud,
  listarPorSede,
  responderSolicitud,
  listarMisSolicitudes,
  cancelarSolicitud,
  obtenerAutosParaSolicitud,
} from "../controllers/solicitudAuto.controller.js";
import {
  authMiddleware,
  isAdminOrSecretaria,
} from "../middleware/auth.middleware.js";

const router = Router();
//POST /api/solicitudes-auto
router.post("/", authMiddleware, crearSolicitud);
router.get("/mis-solicitudes", authMiddleware, listarMisSolicitudes);
router.delete("/:id", authMiddleware, cancelarSolicitud);

router.get("/sede/:idSede", authMiddleware, isAdminOrSecretaria, listarPorSede);
router.patch("/:id", authMiddleware, isAdminOrSecretaria, responderSolicitud);
router.get("/:id/autos-disponibles", authMiddleware, isAdminOrSecretaria, obtenerAutosParaSolicitud);

export default router;
