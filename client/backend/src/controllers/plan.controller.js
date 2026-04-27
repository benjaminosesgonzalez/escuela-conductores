"use strict";
import {
  getPlansService,
  getPlanByIdService,
  createPlanService,
  updatePlanService,
  deletePlanService,
} from "../services/plan.service.js";
import {
  handleErrorClient,
  handleErrorServer,
  handleSuccess,
} from "../Handlers/responseHandlers.js";

export async function getPlans(req, res) {
  try {
    const plans = await getPlansService();

    if (!plans) {
      return handleErrorClient(res, 404, "No se encontraron planes.");
    }

    handleSuccess(res, 200, "Planes obtenidos exitosamente.", plans);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getPlanById(req, res) {
  try {
    const { id } = req.params;
    const plan = await getPlanByIdService(id);

    if (!plan) {
      return handleErrorClient(res, 404, "Plan no encontrado.");
    }

    handleSuccess(res, 200, "Plan obtenido exitosamente.", plan);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createPlan(req, res) {
  try {
    const planData = req.body;
    const newPlan = await createPlanService(planData);

    if (!newPlan) {
      return handleErrorClient(res, 400, "No se pudo crear el plan.");
    }

    handleSuccess(res, 201, "Plan creado exitosamente.", newPlan);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const planData = req.body;

    const updatedPlan = await updatePlanService(id, planData);

    if (!updatedPlan) {
      return handleErrorClient(res, 404, "Plan no encontrado.");
    }

    handleSuccess(res, 200, "Plan actualizado exitosamente.", updatedPlan);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deletePlan(req, res) {
  try {
    const { id } = req.params;

    const deletedPlan = await deletePlanService(id);

    if (!deletedPlan) {
      return handleErrorClient(res, 404, "Plan no encontrado.");
    }

    handleSuccess(res, 200, "Plan eliminado exitosamente.", deletedPlan);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
