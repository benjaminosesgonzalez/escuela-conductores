import {
  obtenerAlumnosConDisponibilidades,
  crearClaseService,
  obtenerClasesAlumnoService,
  obtenerClasesProfesorService,
} from "../services/clase.service.js";
import { obtenerProfesoresDisponibles } from "../services/disponibilidad.service.js";

// Obtener alumnos con disponibilidades seleccionadas
export const obtenerAlumnosParaAgendar = async (req, res) => {
  try {
    const alumnos = await obtenerAlumnosConDisponibilidades();

    res.status(200).json({
      success: true,
      message: "Alumnos obtenidos",
      data: alumnos,
    });
  } catch (error) {
    console.error("Error en obtenerAlumnosParaAgendar:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener alumnos",
    });
  }
};

// Obtener profesores disponibles para un horario específico
export const obtenerProfesoresDisponiblesCtrl = async (req, res) => {
  try {
    const { dia, horaInicio, horaFin } = req.query;

    if (!dia || !horaInicio || !horaFin) {
      return res.status(400).json({
        success: false,
        message: "Los parámetros dia, horaInicio y horaFin son requeridos",
      });
    }

    const disponibles = await obtenerProfesoresDisponibles(
      dia.toLowerCase(),
      horaInicio,
      horaFin
    );

    res.status(200).json({
      success: true,
      message: "Profesores disponibles obtenidos",
      data: disponibles,
    });
  } catch (error) {
    console.error("Error en obtenerProfesoresDisponibles:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener profesores",
    });
  }
};

// Crear una clase
export const crearClase = async (req, res) => {
  try {
    const { alumnoId, profesorId, diaSemana, horaInicio, horaFin } = req.body;

    if (!alumnoId || !profesorId || !diaSemana || !horaInicio || !horaFin) {
      return res.status(400).json({
        success: false,
        message: "Todos los parámetros son requeridos",
      });
    }

    const clase = await crearClaseService(
      alumnoId,
      profesorId,
      diaSemana,
      horaInicio,
      horaFin
    );

    res.status(201).json({
      success: true,
      message: "Clase agendada exitosamente",
      data: clase,
    });
  } catch (error) {
    console.error("Error en crearClase:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al crear clase",
    });
  }
};

// Obtener clases de un alumno
export const obtenerClasesAlumno = async (req, res) => {
  try {
    const { alumnoId } = req.params;

    const clases = await obtenerClasesAlumnoService(parseInt(alumnoId));

    res.status(200).json({
      success: true,
      message: "Clases obtenidas",
      data: clases,
    });
  } catch (error) {
    console.error("Error en obtenerClasesAlumno:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener clases",
    });
  }
};

// Obtener clases de un profesor
export const obtenerClasesProfesor = async (req, res) => {
  try {
    const { profesorId } = req.params;

    const clases = await obtenerClasesProfesorService(parseInt(profesorId));

    res.status(200).json({
      success: true,
      message: "Clases obtenidas",
      data: clases,
    });
  } catch (error) {
    console.error("Error en obtenerClasesProfesor:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener clases",
    });
  }
};
