"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Plan } from "../entities/plan.entity.js";

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

/**
 * Crea un nuevo plan en la base de datos.
 * @param {Object} planData - Datos del plan (nombre, precio, clases, etc.)
 */
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
