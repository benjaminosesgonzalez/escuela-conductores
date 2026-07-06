import {
  generarBloquesDisponibilidad,
  obtenerDisponibilidadesPorProfesor,
  actualizarDisponibilidad,
  actualizarMultiplesDisponibilidades,
  obtenerDisponibilidadesPorDia,
  obtenerProfesoresDisponibles,
  obtenerConfiguracionHorario,
} from "../services/disponibilidad.service.js";
import { sendResponse } from "../Handlers/responseHandlers.js";

/**
 * Generar bloques de disponibilidad para un profesor
 */
export const generarBloques = async (req, res) => {
  try {
    const { profesorId } = req.params;
    const { horaInicio = 9, horaFin = 17, intervaloMinutos = 90, diasLaboral } = req.body;

    const resultado = await generarBloquesDisponibilidad(
      parseInt(profesorId),
      horaInicio,
      horaFin,
      intervaloMinutos,
      diasLaboral
    );

    sendResponse(res, 201, true, "Bloques generados exitosamente", resultado);
  } catch (error) {
    console.error("Error en generarBloques:", error);
    sendResponse(res, 500, false, error.message || "Error al generar bloques");
  }
};

/**
 * Obtener disponibilidades de un profesor (agrupadas por día)
 */
export const obtenerDisponibilidades = async (req, res) => {
  try {
    const { profesorId } = req.params;
    const disponibilidades = await obtenerDisponibilidadesPorProfesor(parseInt(profesorId));

    sendResponse(res, 200, true, "Disponibilidades obtenidas", disponibilidades);
  } catch (error) {
    console.error("Error en obtenerDisponibilidades:", error);
    sendResponse(res, 500, false, error.message || "Error al obtener disponibilidades");
  }
};

/**
 * Obtener disponibilidades por día específico
 */
export const obtenerDisponibilidadesPorDiaController = async (req, res) => {
  try {
    const { profesorId } = req.params;
    const { dia } = req.query;

    if (!dia) {
      return sendResponse(res, 400, false, "El parámetro 'dia' es requerido");
    }

    const disponibilidades = await obtenerDisponibilidadesPorDia(
      parseInt(profesorId),
      dia.toLowerCase()
    );

    sendResponse(res, 200, true, "Disponibilidades del día obtenidas", disponibilidades);
  } catch (error) {
    console.error("Error en obtenerDisponibilidadesPorDiaController:", error);
    sendResponse(res, 500, false, error.message || "Error al obtener disponibilidades");
  }
};

/**
 * Actualizar disponibilidad de un bloque
 */
export const actualizarDisponibilidadBloque = async (req, res) => {
  try {
    const { bloqueId } = req.params;
    const { disponible } = req.body;

    if (typeof disponible !== "boolean") {
      return sendResponse(res, 400, false, "El parámetro 'disponible' debe ser boolean");
    }

    const actualizado = await actualizarDisponibilidad(parseInt(bloqueId), disponible);

    if (actualizado) {
      sendResponse(res, 200, true, "Disponibilidad actualizada", { id: bloqueId, disponible });
    } else {
      sendResponse(res, 404, false, "Bloque no encontrado");
    }
  } catch (error) {
    console.error("Error en actualizarDisponibilidadBloque:", error);
    sendResponse(res, 500, false, error.message || "Error al actualizar disponibilidad");
  }
};

/**
 * Actualizar múltiples disponibilidades
 */
export const actualizarMultiples = async (req, res) => {
  try {
    const { ids, disponible } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, 400, false, "Se requiere un array de ids no vacío");
    }

    if (typeof disponible !== "boolean") {
      return sendResponse(res, 400, false, "El parámetro 'disponible' debe ser boolean");
    }

    const actualizado = await actualizarMultiplesDisponibilidades(ids, disponible);

    if (actualizado) {
      sendResponse(res, 200, true, "Disponibilidades actualizadas", { cantidad: ids.length });
    } else {
      sendResponse(res, 500, false, "No se pudieron actualizar los registros");
    }
  } catch (error) {
    console.error("Error en actualizarMultiples:", error);
    sendResponse(res, 500, false, error.message || "Error al actualizar disponibilidades");
  }
};

/**
 * Obtener profesores disponibles en un horario específico (para vista de alumnos)
 */
export const obtenerProfesoresDisponiblesController = async (req, res) => {
  try {
    const { dia, horaInicio, horaFin } = req.query;

    if (!dia || !horaInicio || !horaFin) {
      return sendResponse(res, 400, false, "Los parámetros 'dia', 'horaInicio' y 'horaFin' son requeridos");
    }

    const disponibles = await obtenerProfesoresDisponibles(dia.toLowerCase(), horaInicio, horaFin);

    sendResponse(res, 200, true, "Profesores disponibles obtenidos", disponibles);
  } catch (error) {
    console.error("Error en obtenerProfesoresDisponiblesController:", error);
    sendResponse(res, 500, false, error.message || "Error al obtener profesores disponibles");
  }
};

/**
 * Obtener configuración de horario del profesor
 */
export const obtenerConfiguracion = async (req, res) => {
  try {
    const { profesorId } = req.params;
    const configuracion = await obtenerConfiguracionHorario(parseInt(profesorId));

    if (!configuracion) {
      return sendResponse(res, 404, false, "No hay bloques configurados para este profesor");
    }

    sendResponse(res, 200, true, "Configuración obtenida", configuracion);
  } catch (error) {
    console.error("Error en obtenerConfiguracion:", error);
    sendResponse(res, 500, false, error.message || "Error al obtener configuración");
  }
};
