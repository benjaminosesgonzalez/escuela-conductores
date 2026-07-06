import { Router } from "express";
import {
  createAuto,
  getAutos,
  getDisponibilidadSede,
  updateAuto,
  deleteAuto,
} from "../controllers/auto.controller.js";
import {
  authMiddleware,
  isAdminOrSecretaria,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, getAutos);
router.get("/disponibilidad/:idSede", authMiddleware, getDisponibilidadSede);

router.post("/", authMiddleware, isAdminOrSecretaria, createAuto);
router.put("/:id", authMiddleware, isAdminOrSecretaria, updateAuto);
router.delete("/:id", authMiddleware, isAdminOrSecretaria, deleteAuto);

export default router;
