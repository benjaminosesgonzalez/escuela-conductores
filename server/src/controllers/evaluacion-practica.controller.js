import {
  obtenerCriterios,
  obtenerClasesPracticasProfesor,
  crearEvaluacion,
  agregarCriterioAEvaluacion,
  obtenerCriteriosEvaluacion,
  terminarEvaluacion,
  obtenerHistorialEvaluacionesProfesor,
} from "../services/evaluacion-practica.service.js";

export const obtener_criterios = async (req, res) => {
  try {
    const criterios = await obtenerCriterios();

    res.json({
      success: true,
      criterios,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener criterios",
      error: error.message,
    });
  }
};

export const obtener_clases_practicas_profesor = async (req, res) => {
  try {
    const { profesorId } = req.params;

    if (!profesorId) {
      return res.status(400).json({
        success: false,
        message: "profesorId es requerido",
      });
    }

    const clases = await obtenerClasesPracticasProfesor(parseInt(profesorId));

    res.json({
      success: true,
      clases,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener clases prácticas",
      error: error.message,
    });
  }
};

export const crear_evaluacion = async (req, res) => {
  try {
    const { clasePracticaId, profesorId, alumnoId } = req.body;

    if (!clasePracticaId || !profesorId || !alumnoId) {
      return res.status(400).json({
        success: false,
        message:
          "clasePracticaId, profesorId y alumnoId son requeridos",
      });
    }

    const evaluacion = await crearEvaluacion(
      parseInt(clasePracticaId),
      parseInt(profesorId),
      parseInt(alumnoId)
    );

    res.json({
      success: true,
      evaluacion,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear evaluación",
      error: error.message,
    });
  }
};

export const agregar_criterio = async (req, res) => {
  try {
    const { evaluacionId, criterioId } = req.body;

    if (!evaluacionId || !criterioId) {
      return res.status(400).json({
        success: false,
        message: "evaluacionId y criterioId son requeridos",
      });
    }

    const resultado = await agregarCriterioAEvaluacion(
      parseInt(evaluacionId),
      parseInt(criterioId)
    );

    res.json({
      success: true,
      ...resultado,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar criterio",
      error: error.message,
    });
  }
};

export const obtener_criterios_evaluacion = async (req, res) => {
  try {
    const { evaluacionId } = req.params;

    if (!evaluacionId) {
      return res.status(400).json({
        success: false,
        message: "evaluacionId es requerido",
      });
    }

    const criterios = await obtenerCriteriosEvaluacion(
      parseInt(evaluacionId)
    );

    res.json({
      success: true,
      criterios,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener criterios",
      error: error.message,
    });
  }
};

export const terminar_evaluacion = async (req, res) => {
  try {
    const { evaluacionId } = req.params;

    if (!evaluacionId) {
      return res.status(400).json({
        success: false,
        message: "evaluacionId es requerido",
      });
    }

    const resultado = await terminarEvaluacion(parseInt(evaluacionId));

    res.json({
      success: true,
      ...resultado,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al terminar evaluación",
      error: error.message,
    });
  }
};

export const obtener_historial_profesor = async (req, res) => {
  try {
    const { profesorId } = req.params;

    if (!profesorId) {
      return res.status(400).json({
        success: false,
        message: "profesorId es requerido",
      });
    }

    const evaluaciones = await obtenerHistorialEvaluacionesProfesor(
      parseInt(profesorId)
    );

    res.json({
      success: true,
      evaluaciones,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener historial",
      error: error.message,
    });
  }
};
