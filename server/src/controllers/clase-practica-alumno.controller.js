import {
  obtenerClasesPracticasDisponibles,
  inscribirAlumnoEnClasePractica,
  desinscribirAlumnoDeClasePractica,
  obtenerMisClasesPracticasAlumno,
} from "../services/clase-practica-alumno.service.js";

export const getClasesPracticasDisponibles = async (req, res) => {
  try {
    const semana = parseInt(req.query.semana) || 0;
    const resultado = await obtenerClasesPracticasDisponibles(semana);

    res.json(resultado);
  } catch (error) {
    console.error("Error en getClasesPracticasDisponibles:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener clases prácticas disponibles",
    });
  }
};

export const enrollClasePractica = async (req, res) => {
  try {
    const { id: clasePracticaId } = req.params;
    const userId = req.user.id;

    const resultado = await inscribirAlumnoEnClasePractica(clasePracticaId, userId);

    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    console.error("Error en enrollClasePractica:", error);
    res.status(500).json({
      success: false,
      message: "Error al inscribirse en la clase práctica",
    });
  }
};

export const unenrollClasePractica = async (req, res) => {
  try {
    const { id: clasePracticaId } = req.params;
    const userId = req.user.id;

    const resultado = await desinscribirAlumnoDeClasePractica(clasePracticaId, userId);

    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    console.error("Error en unenrollClasePractica:", error);
    res.status(500).json({
      success: false,
      message: "Error al desinscribirse de la clase práctica",
    });
  }
};

export const getMisClasesPracticas = async (req, res) => {
  try {
    const userId = req.user.id;

    const resultado = await obtenerMisClasesPracticasAlumno(userId);

    res.json(resultado);
  } catch (error) {
    console.error("Error en getMisClasesPracticas:", error);
    res.status(500).json({
      success: false,
      clases: [],
      message: "Error al obtener mis clases prácticas",
    });
  }
};
