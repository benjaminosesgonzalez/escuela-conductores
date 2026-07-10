"use strict";
import { Router } from "express";
import {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  toggleInscripcionesPlan,
} from "../controllers/plan.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// obtener todos los planes: GET /api/plans
router.get("/", getPlans);

// obtener un plan por su ID: GET /api/plans/:id
router.get("/:id", getPlanById);
// crear plan: POST /api/plans
router.post("/", authMiddleware, isAdmin, createPlan);

router.patch(
  "/:id/toggle-enrollment",
  authMiddleware,
  isAdmin,
  toggleInscripcionesPlan,
);

router.put("/:id", authMiddleware, isAdmin, updatePlan); // PUT /api/plans/:id
router.delete("/:id", authMiddleware, isAdmin, deletePlan);

export default router;
