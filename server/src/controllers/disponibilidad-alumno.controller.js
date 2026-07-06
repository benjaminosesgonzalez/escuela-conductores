import {
  generarBloquesDisponibilidadAlumnoService,
  obtenerDisponibilidadesAlumnoService,
  actualizarDisponibilidadAlumnoService,
  actualizarMultiplesDisponibilidadesAlumnoService,
  obtenerDisponibilidadesAlumnoPorDiaService,
  obtenerDisponibilidadesAlumnoDisponiblesService,
} from "../services/disponibilidad-alumno.service.js";
import { AppDataSource } from "../config/configDb.js";
import { Alumno } from "../entities/alumno.entity.js";

const alumnoRepository = AppDataSource.getRepository(Alumno);

/**
 * Generar bloques de disponibilidad para un alumno basado en su plan
 */
export const generarBloquesAlumno = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    let { totalClases, diasLaboral = ["lunes", "martes", "miércoles", "jueves", "viernes"] } = req.body;

    if (!alumnoId) {
      return res.status(400).json({
        success: false,
        message: "alumnoId es requerido"
      });
    }

    // Verificar que el alumno existe
    const alumno = await alumnoRepository.findOneBy({ id: parseInt(alumnoId) });
    if (!alumno) {
      return res.status(404).json({
        success: false,
        message: "Alumno no encontrado"
      });
    }

    // Si no se proporciona totalClases, obtenerlo del plan
    if (!totalClases && alumno.id_plan_matriculado) {
      const planResult = await AppDataSource.query(
        "SELECT total_classes FROM plans WHERE id = $1",
        [alumno.id_plan_matriculado]
      );

      if (planResult.length > 0) {
        totalClases = planResult[0].total_classes;
      } else {
        totalClases = 4; // Default
      }
    } else if (!totalClases) {
      totalClases = 4; // Default si no hay plan
    }

    console.log(`📅 Generando bloques para alumno ${alumnoId}: ${totalClases} clases`);

    const resultado = await generarBloquesDisponibilidadAlumnoService(
      parseInt(alumnoId),
      parseInt(totalClases),
      diasLaboral
    );

    res.status(201).json({
      success: true,
      message: "Bloques generados exitosamente",
      data: resultado
    });
  } catch (error) {
    console.error("Error en generarBloquesAlumno:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al generar bloques"
    });
  }
};

/**
 * Obtener disponibilidades de un alumno
 */
export const obtenerDisponibilidadesAlumno = async (req, res) => {
  try {
    const { alumnoId } = req.params;

    const disponibilidades = await obtenerDisponibilidadesAlumnoService(parseInt(alumnoId));

    res.status(200).json({
      success: true,
      message: "Disponibilidades obtenidas",
      data: disponibilidades
    });
  } catch (error) {
    console.error("Error en obtenerDisponibilidadesAlumno:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener disponibilidades"
    });
  }
};

/**
 * Obtener disponibilidades por día específico
 */
export const obtenerDisponibilidadesAlumnoPorDia = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const { dia } = req.query;

    if (!dia) {
      return res.status(400).json({
        success: false,
        message: "El parámetro 'dia' es requerido"
      });
    }

    const disponibilidades = await obtenerDisponibilidadesAlumnoPorDiaService(
      parseInt(alumnoId),
      dia.toLowerCase()
    );

    res.status(200).json({
      success: true,
      message: "Disponibilidades del día obtenidas",
      data: disponibilidades
    });
  } catch (error) {
    console.error("Error en obtenerDisponibilidadesAlumnoPorDia:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener disponibilidades"
    });
  }
};

/**
 * Actualizar disponibilidad de un bloque
 */
export const actualizarDisponibilidadAlumnoBloque = async (req, res) => {
  try {
    const { bloqueId } = req.params;
    const { disponible } = req.body;

    if (typeof disponible !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "El parámetro 'disponible' debe ser boolean"
      });
    }

    const actualizado = await actualizarDisponibilidadAlumnoService(parseInt(bloqueId), disponible);

    if (actualizado) {
      res.status(200).json({
        success: true,
        message: "Disponibilidad actualizada",
        data: { id: bloqueId, disponible }
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Bloque no encontrado"
      });
    }
  } catch (error) {
    console.error("Error en actualizarDisponibilidadAlumnoBloque:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al actualizar disponibilidad"
    });
  }
};

/**
 * Actualizar múltiples disponibilidades
 */
export const actualizarMultiplesDisponibilidadesAlumno = async (req, res) => {
  try {
    const { ids, disponible, bloques } = req.body;

    // Formato 2: bloques con estados individuales
    if (bloques && Array.isArray(bloques) && bloques.length > 0) {
      for (const bloque of bloques) {
        await actualizarDisponibilidadAlumnoService(bloque.id, bloque.disponible);
      }

      return res.status(200).json({
        success: true,
        message: "Disponibilidades actualizadas",
        data: { cantidad: bloques.length }
      });
    }

    // Formato 1: ids con un único estado
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de ids o bloques no vacío"
      });
    }

    if (typeof disponible !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "El parámetro 'disponible' debe ser boolean"
      });
    }

    const actualizado = await actualizarMultiplesDisponibilidadesAlumnoService(ids, disponible);

    if (actualizado) {
      res.status(200).json({
        success: true,
        message: "Disponibilidades actualizadas",
        data: { cantidad: ids.length }
      });
    } else {
      res.status(500).json({
        success: false,
        message: "No se pudieron actualizar los registros"
      });
    }
  } catch (error) {
    console.error("Error en actualizarMultiplesDisponibilidadesAlumno:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al actualizar disponibilidades"
    });
  }
};

/**
 * Obtener disponibilidades disponibles de un alumno en un horario específico (para secretaria)
 */
export const obtenerDisponibilidadesAlumnoDisponibles = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const { dia, horaInicio, horaFin } = req.query;

    if (!dia || !horaInicio || !horaFin) {
      return res.status(400).json({
        success: false,
        message: "Los parámetros 'dia', 'horaInicio' y 'horaFin' son requeridos"
      });
    }

    const disponibles = await obtenerDisponibilidadesAlumnoDisponiblesService(
      parseInt(alumnoId),
      dia.toLowerCase(),
      horaInicio,
      horaFin
    );

    res.status(200).json({
      success: true,
      message: "Disponibilidades disponibles obtenidas",
      data: disponibles
    });
  } catch (error) {
    console.error("Error en obtenerDisponibilidadesAlumnoDisponibles:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener disponibilidades disponibles"
    });
  }
};
