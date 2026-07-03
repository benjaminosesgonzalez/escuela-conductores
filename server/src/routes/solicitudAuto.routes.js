import { Router } from "express";
import {
  crearSolicitud,
  listarPorSede,
  responderSolicitud,
  listarMisSolicitudes,
  cancelarSolicitud,
} from "../controllers/solicitudAuto.controller.js";
import {
  authMiddleware,
  isAdminOrSecretaria,
} from "../middleware/auth.middleware.js";

const router = Router();

// Cualquiera logueado puede solicitar
router.post("/", authMiddleware, crearSolicitud);
router.get("/mis-solicitudes", authMiddleware, listarMisSolicitudes);
router.delete("/:id", authMiddleware, cancelarSolicitud);

// Solo Secretaria o Admin gestionan
router.get("/sede/:idSede", authMiddleware, isAdminOrSecretaria, listarPorSede);
router.patch("/:id", authMiddleware, isAdminOrSecretaria, responderSolicitud);

export default router;
