"use strict";
import {
  getPlansService,
  getPlanByIdService,
  createPlanService,
} from "../services/plan.service.js";

export async function createPlan(req, res) {
  try {
    const planData = req.body;
    const newPlan = await createPlanService(planData);

    if (!newPlan) {
      return res.status(400).json({ message: "No se pudo crear el plan" });
    }

    res.status(201).json({
      message: "Plan creado exitosamente",
      data: newPlan,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
}

export async function getPlans(req, res) {
  try {
    const plans = await getPlansService();
    if (!plans) {
      return res.status(404).json({ message: "No se encontraron planes" });
    }
    res.status(200).json(plans);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los planes", error: error.message });
  }
}

export async function getPlanById(req, res) {
  try {
    const { id } = req.params;
    const plan = await getPlanByIdService(id);
    if (!plan) {
      return res.status(404).json({ message: "Plan no encontrado" });
    }
    res.status(200).json(plan);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el plan", error: error.message });
  }
}
