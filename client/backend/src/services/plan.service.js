"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Plan } from "../entities/plan.entity.js";

/**
 * Obtiene todos los planes de la base de datos.
 */
export async function getPlansService() {
  try {
    const planRepository = AppDataSource.getRepository(Plan);
    return await planRepository.find();
  } catch (error) {
    console.error("Error al obtener los planes:", error);
    return null;
  }
}

/**
 * Obtiene un plan por su ID.
 * @param {number} id
 */
export async function getPlanByIdService(id) {
  try {
    const planRepository = AppDataSource.getRepository(Plan);
    return await planRepository.findOneBy({ id: Number(id) });
  } catch (error) {
    console.error("Error al obtener el plan:", error);
    return null;
  }
}

/**
 * Crea un nuevo plan en la base de datos.
 * @param {Object} planData - Datos del plan (name, price, total_classes, etc.)
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

/**
 * Actualiza un plan existente (precio, nombre, clases, nivel teórico, etc.).
 * Solo se actualizan los campos explícitamente enviados en el body.
 * @param {number} id
 * @param {Object} planData - Campos a actualizar
 */
export async function updatePlanService(id, planData) {
  try {
    const planRepository = AppDataSource.getRepository(Plan);

    const plan = await planRepository.findOneBy({ id: Number(id) });
    if (!plan) return null;

    const allowed_fields = [
      "name",
      "price",
      "total_classes",
      "theoretical_level",
      "simulator_classes",
    ];

    allowed_fields.forEach((field) => {
      if (planData[field] !== undefined) {
        plan[field] = planData[field];
      }
    });

    return await planRepository.save(plan);
  } catch (error) {
    console.error("Error al actualizar el plan:", error);
    return null;
  }
}

/**
 * Elimina un plan de la base de datos por su ID.
 * Retorna el objeto eliminado como confirmación.
 * @param {number} id
 */
export async function deletePlanService(id) {
  try {
    const planRepository = AppDataSource.getRepository(Plan);

    const plan = await planRepository.findOneBy({ id: Number(id) });
    if (!plan) return null;

    await planRepository.remove(plan);
    return plan;
  } catch (error) {
    console.error("Error al eliminar el plan:", error);
    return null;
  }
}
