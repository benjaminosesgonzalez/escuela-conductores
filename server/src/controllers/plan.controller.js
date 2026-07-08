"use strict";
import {
  getPlansService,
  getPlanByIdService,
  createPlanService,
} from "../services/plan.service.js";

export async function createPlan(req, res) {
  try {
    // 1. Extraemos las llaves en ESPAÑOL que vienen de Postman o el Frontend
    const { 
      nombre, 
      precio, 
      clases_totales, 
      nivel_teorico, 
      clases_simulador 
    } = req.body;

    // 2. Validación básica para evitar que lleguen vacíos
    if (!nombre) {
      return res.status(400).json({ message: "El nombre del plan es obligatorio" });
    }

    // 3. MAPEO: Traducimos del español al inglés que exige la Entidad/Base de datos
    const planDataFormatTypeORM = {
      name: nombre,
      price: precio,
      total_classes: clases_totales,
      theoretical_level: nivel_teorico,
      simulator_classes: clases_simulador
    };

    // 4. Enviamos el objeto ya traducido al servicio
    const nuevoPlan = await createPlanService(planDataFormatTypeORM);

    return res.status(201).json({ 
      success: true, 
      message: "Plan creado exitosamente",
      data: nuevoPlan 
    });

  } catch (error) {
    console.error("Error al crear plan:", error);
    return res.status(400).json({ 
      success: false, 
      message: "No se pudo crear el plan", 
      error: error.message 
    });
  }
}

export async function getPlans(req, res) {
  try {
    const plans = await getPlansService();
    if (!plans) {
      return res.status(404).json({ success: false, message: "No se encontraron planes" });
    }
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener los planes", error: error.message });
  }
}

export async function getPlanById(req, res) {
  try {
    const { id } = req.params;
    const plan = await getPlanByIdService(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan no encontrado" });
    }
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error al obtener el plan", error: error.message });
  }
}
