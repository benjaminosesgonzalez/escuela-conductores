import {
  generarBloquesDisponibilidad,
  obtenerDisponibilidadesPorProfesor,
  actualizarDisponibilidad,
  actualizarMultiplesDisponibilidades,
  obtenerDisponibilidadesPorDia,
  obtenerProfesoresDisponibles,
  obtenerConfiguracionHorario,
} from "../services/disponibilidad.service.js";
import { generarClasesOnlineService } from "../services/clase-online.service.js";
import { sendResponse } from "../Handlers/responseHandlers.js";

/**
 * Generar bloques de disponibilidad para un profesor según tipo de contrato
 * También genera automáticamente las clases online correspondientes
 */
export const generarBloques = async (req, res) => {
  try {
    const { profesorId } = req.params;
    const { tipoContrato = "full_time", diasLaboral = ["lunes", "martes", "miércoles", "jueves", "viernes"] } = req.body;

    console.log(`🏫 GENERANDO BLOQUES para profesor ${profesorId}`);

    const resultado = await generarBloquesDisponibilidad(
      parseInt(profesorId),
      tipoContrato,
      diasLaboral
    );

    console.log(`📋 Resultado de generar bloques:`, resultado);

    // Generar automáticamente las clases online después de crear disponibilidades
    let clasesOnlineResultado = { success: false };
    if (resultado.success || resultado.bloques > 0) {
      try {
        console.log(`🎬 Iniciando generación de clases online...`);
        clasesOnlineResultado = await generarClasesOnlineService(parseInt(profesorId));
        console.log("✨ Clases online generadas automáticamente:", clasesOnlineResultado);
      } catch (claseError) {
        console.error("❌ Error generando clases online automáticamente:", claseError);
        // No fallar la respuesta si hay error en clases online
      }
    }

    sendResponse(res, 201, true, "Bloques y clases online generados exitosamente", {
      ...resultado,
      clasesOnline: clasesOnlineResultado,
    });
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
 * Regenera automáticamente las clases online del profesor
 */
export const actualizarDisponibilidadBloque = async (req, res) => {
  try {
    const { bloqueId } = req.params;
    const { disponible } = req.body;

    if (typeof disponible !== "boolean") {
      return sendResponse(res, 400, false, "El parámetro 'disponible' debe ser boolean");
    }

    // Obtener el bloque para saber a qué profesor pertenece
    const { AppDataSource } = await import("../config/configDb.js");
    const bloque = await AppDataSource.query(
      `SELECT "profesorId" FROM disponibilidades WHERE id = $1`,
      [bloqueId]
    );

    if (bloque.length === 0) {
      return sendResponse(res, 404, false, "Bloque no encontrado");
    }

    const profesorId = bloque[0].profesorId;

    // Actualizar disponibilidad
    const actualizado = await actualizarDisponibilidad(parseInt(bloqueId), disponible);

    if (actualizado) {
      // Regenerar automáticamente las clases online del profesor
      try {
        const { generarClasesOnlineService } = await import("../services/clase-online.service.js");
        await generarClasesOnlineService(profesorId);
        console.log(`✅ Clases regeneradas automáticamente para profesor ${profesorId}`);
      } catch (claseError) {
        console.error("⚠️ Error regenerando clases:", claseError.message);
        // No fallar la respuesta si hay error en la regeneración
      }

      sendResponse(res, 200, true, "Disponibilidad actualizada y clases regeneradas", { id: bloqueId, disponible });
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
 * Soporta dos formatos:
 * 1. { ids: [1,2,3], disponible: true } - actualiza todos con el mismo estado
 * 2. { bloques: [{id: 1, disponible: true}, {id: 2, disponible: false}] } - estados individuales
 * Regenera automáticamente las clases online del profesor
 */
export const actualizarMultiples = async (req, res) => {
  try {
    const { ids, disponible, bloques } = req.body;
    const { AppDataSource } = await import("../config/configDb.js");
    const { generarClasesOnlineService } = await import("../services/clase-online.service.js");

    // Obtener profesorId de los bloques a actualizar
    let idsAActualizar = [];
    let profesorId = null;

    // Formato 2: bloques con estados individuales
    if (bloques && Array.isArray(bloques) && bloques.length > 0) {
      idsAActualizar = bloques.map(b => b.id);

      // Obtener profesorId
      const bloqueInfo = await AppDataSource.query(
        `SELECT "profesorId" FROM disponibilidades WHERE id = $1 LIMIT 1`,
        [idsAActualizar[0]]
      );
      if (bloqueInfo.length > 0) {
        profesorId = bloqueInfo[0].profesorId;
      }

      // Actualizar cada bloque con su estado correspondiente
      for (const bloque of bloques) {
        await actualizarDisponibilidad(bloque.id, bloque.disponible, bloque.fecha);
      }

      // Regenerar clases si tenemos profesorId
      if (profesorId) {
        try {
          await generarClasesOnlineService(profesorId);
          console.log(`✅ Clases regeneradas automáticamente para profesor ${profesorId}`);
        } catch (claseError) {
          console.error("⚠️ Error regenerando clases:", claseError.message);
        }
      }

      return sendResponse(res, 200, true, "Disponibilidades actualizadas y clases regeneradas", { cantidad: bloques.length });
    }

    // Formato 1: ids con un único estado
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, 400, false, "Se requiere un array de ids o bloques no vacío");
    }

    if (typeof disponible !== "boolean") {
      return sendResponse(res, 400, false, "El parámetro 'disponible' debe ser boolean");
    }

    // Obtener profesorId
    const bloqueInfo = await AppDataSource.query(
      `SELECT "profesorId" FROM disponibilidades WHERE id = $1 LIMIT 1`,
      [ids[0]]
    );
    if (bloqueInfo.length > 0) {
      profesorId = bloqueInfo[0].profesorId;
    }

    const actualizado = await actualizarMultiplesDisponibilidades(ids, disponible);

    if (actualizado) {
      // Regenerar clases si tenemos profesorId
      if (profesorId) {
        try {
          await generarClasesOnlineService(profesorId);
          console.log(`✅ Clases regeneradas automáticamente para profesor ${profesorId}`);
        } catch (claseError) {
          console.error("⚠️ Error regenerando clases:", claseError.message);
        }
      }

      sendResponse(res, 200, true, "Disponibilidades actualizadas y clases regeneradas", { cantidad: ids.length });
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

/**
 * Regenerar bloques para un profesor específico
 * Elimina bloques sin fecha y genera nuevos para 2 semanas
 */
export const regenerarBloquesController = async (req, res) => {
  try {
    const { profesorId } = req.params;
    const { regenerarBloquesProfesor } = await import("../services/disponibilidad-fix.service.js");

    const resultado = await regenerarBloquesProfesor(parseInt(profesorId));

    if (resultado.success) {
      sendResponse(res, 200, true, "Bloques regenerados exitosamente", resultado);
    } else {
      sendResponse(res, 400, false, resultado.message || "No se pudieron regenerar los bloques");
    }
  } catch (error) {
    console.error("Error en regenerarBloquesController:", error);
    sendResponse(res, 500, false, error.message || "Error al regenerar bloques");
  }
};

/**
 * Regenerar bloques para TODOS los profesores
 */
export const regenerarTodosBloquesController = async (req, res) => {
  try {
    const { regenerarTodosLosBloque } = await import("../services/disponibilidad-fix.service.js");

    const resultado = await regenerarTodosLosBloque();

    if (resultado.success) {
      sendResponse(res, 200, true, "Bloques regenerados para todos los profesores", resultado);
    } else {
      sendResponse(res, 400, false, "Hubo errores regenerando bloques", resultado);
    }
  } catch (error) {
    console.error("Error en regenerarTodosBloquesController:", error);
    sendResponse(res, 500, false, error.message || "Error al regenerar bloques");
  }
};
