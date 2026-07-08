"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Plan } from "../entities/plan.entity.js";

// ✅ CORREGIDO: Ahora sí busca los elementos reales en la base de datos
export async function getPlansService() {
  try {
    const planRepository = AppDataSource.getRepository(Plan);
    return await planRepository.find();
  } catch (error) {
    console.error("Error al obtener los planes:", error);
    return null;
  }
}

export async function getPlanByIdService(id) {
  try {
    const planRepository = AppDataSource.getRepository(Plan);
    return await planRepository.findOneBy({ id });
  } catch (error) {
    console.error("Error al obtener el plan:", error);
    return null;
  }
}

export async function createPlanService(planData) {
  try {
    const planRepository = AppDataSource.getRepository(Plan);
    const newPlan = planRepository.create(planData);
    return await planRepository.save(newPlan);
  } catch (error) {
    console.error("Error al crear el plan:", error);
    return null;
  }
}

// 🚀 NUEVO: Servicio para actualizar un plan existente
export async function updatePlanService(id, planData) {
  try {
    const planRepository = AppDataSource.getRepository(Plan);
    await planRepository.update(id, planData);
    return await planRepository.findOneBy({ id });
  } catch (error) {
    console.error("Error al actualizar el plan:", error);
    return null;
  }
}

// 🚀 NUEVO: Servicio para eliminar permanentemente un plan
export async function deletePlanService(id) {
  try {
    const planRepository = AppDataSource.getRepository(Plan);
    const result = await planRepository.delete(id);
    return result.affected > 0;
  } catch (error) {
    console.error("Error al eliminar el plan:", error);
    return false;
  }
}
