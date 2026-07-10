import {
  generarClasesPracticasDesdeDisponibilidades,
  generarTodasLasClasesPracticas,
} from "../services/generar-clases-practicas.service.js";

export const generarClasesPracticasProfesor = async (req, res) => {
  try {
    const { profesorId } = req.params;

    if (!profesorId) {
      return res.status(400).json({
        success: false,
        message: "profesorId es requerido",
      });
    }

    const resultado = await generarClasesPracticasDesdeDisponibilidades(
      parseInt(profesorId)
    );

    res.json(resultado);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar clases prácticas",
      error: error.message,
    });
  }
};

export const generarTodasClasesPracticas = async (req, res) => {
  try {
    const resultado = await generarTodasLasClasesPracticas();

    res.json(resultado);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar clases prácticas",
      error: error.message,
    });
  }
};
