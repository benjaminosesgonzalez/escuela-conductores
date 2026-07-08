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
  isAdminOrSecretaria,
} from "../middleware/auth.middleware.js";

const router = Router();

// obtener todos los planes: GET /api/plans
router.get("/", getPlans);

// obtener un plan por su ID: GET /api/plans/:id
router.get("/:id", getPlanById);
// crear plan: POST /api/plans
router.post("/", authMiddleware, isAdminOrSecretaria, createPlan);

router.put("/:id", authMiddleware, updatePlan); // PUT /api/planes/:id
router.delete("/:id", authMiddleware, deletePlan);

export default router;
