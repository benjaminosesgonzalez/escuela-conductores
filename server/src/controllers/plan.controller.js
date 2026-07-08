"use strict";
import {
  getPlansService,
  getPlanByIdService,
  createPlanService,
  updatePlanService,
  deletePlanService,
} from "../services/plan.service.js";

/**
 * 🔄 FUNCIÓN AUXILIAR: Traduce el objeto de la BD (inglés)
 * al formato exacto que espera tu Frontend (español).
 */
function formatPlanToFrontend(plan) {
  if (!plan) return null;
  return {
    id: plan.id,
    nombre: plan.name,
    precio: plan.price,
    clases_practicas: plan.total_classes,
    nivel_teorico: plan.theoretical_level,
    clases_simulador: plan.simulator_classes,
  };
}

export async function createPlan(req, res) {
  try {
    // 1. Extraemos el set de datos real que envía tu PlanesView.jsx
    const {
      nombre,
      precio,
      clases_practicas,
      clases_totales,
      nivel_teorico,
      clases_simulador,
    } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre es obligatorio",
      });
    }

    // 2. MAPEO: Traducimos del español frontend al inglés de TypeORM
    const planDataFormatTypeORM = {
      name: nombre,
      price: precio,
      total_classes: clases_practicas || clases_totales,
      theoretical_level: nivel_teorico,
      simulator_classes: clases_simulador,
    };

    const nuevoPlan = await createPlanService(planDataFormatTypeORM);

    return res.status(201).json({
      success: true,
      message: "Plan creado exitosamente",
      data: formatPlanToFrontend(nuevoPlan), // Retorna en español
    });
  } catch (error) {
    console.error("Error al crear plan:", error);
    return res.status(400).json({
      success: false,
      message: "No se pudo crear el plan",
      error: error.message,
    });
  }
}

export async function getPlans(req, res) {
  try {
    const plans = await getPlansService();
    if (!plans) {
      return res
        .status(404)
        .json({ success: false, message: "No se encontraron planes" });
    }

    // Convertimos toda la lista de la BD al formato del frontend
    const planesTraducidos = plans.map(formatPlanToFrontend);

    // Tu frontend lee data.data || data, este formato cubre ambas opciones perfectamente
    res.status(200).json({ success: true, data: planesTraducidos });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener los planes",
      error: error.message,
    });
  }
}

export async function getPlanById(req, res) {
  try {
    const { id } = req.params;
    const plan = await getPlanByIdService(id);
    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Plan no encontrado" });
    }
    res.status(200).json({ success: true, data: formatPlanToFrontend(plan) });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el plan",
      error: error.message,
    });
  }
}

// 🚀 NUEVO: Controlador para procesar actualizaciones (PUT)
export async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const {
      nombre,
      precio,
      clases_practicas,
      clases_totales,
      nivel_teorico,
      clases_simulador,
    } = req.body;

    const planDataFormatTypeORM = {
      name: nombre,
      price: precio,
      total_classes: clases_practicas || clases_totales,
      theoretical_level: nivel_teorico,
      simulator_classes: clases_simulador,
    };

    const planActualizado = await updatePlanService(id, planDataFormatTypeORM);
    if (!planActualizado) {
      return res
        .status(404)
        .json({ success: false, message: "El plan no existe" });
    }

    res.status(200).json({
      success: true,
      message: "Plan modificado correctamente",
      data: formatPlanToFrontend(planActualizado),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar el plan",
      error: error.message,
    });
  }
}

// 🚀 NUEVO: Controlador para remover planes (DELETE)
export async function deletePlan(req, res) {
  try {
    const { id } = req.params;
    const eliminado = await deletePlanService(id);

    if (!eliminado) {
      return res.status(404).json({
        success: false,
        message: "No se encontró el plan especificado",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Plan eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al eliminar el plan",
      error: error.message,
    });
  }
}
