"use strict";
import { Router } from "express";
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/plan.controller.js";
import {
  authMiddleware,
  isAdmin,
  isAdminOrSecretaria,
} from "../middleware/auth.middleware.js";

const router = Router();

// ─── Rutas públicas ────────────────────────────────────────────────────────────

// GET /api/plans — cualquier usuario puede consultar los planes disponibles
router.get("/", getPlans);

// GET /api/plans/:id — cualquier usuario puede ver el detalle de un plan
router.get("/:id", getPlanById);

// ─── Rutas protegidas ──────────────────────────────────────────────────────────

// POST /api/plans — crear un nuevo plan (admin o secretaria)
router.post("/", authMiddleware, isAdminOrSecretaria, createPlan);

// PUT /api/plans/:id — actualizar precio, nombre, horas, etc. (admin o secretaria)
router.put("/:id", authMiddleware, isAdminOrSecretaria, updatePlan);

// DELETE /api/plans/:id — eliminar un plan (solo administracion)
router.delete("/:id", authMiddleware, isAdmin, deletePlan);

export default router;
