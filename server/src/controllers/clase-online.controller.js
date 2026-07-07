import {
  generarClasesOnlineService,
  obtenerClasesOnlineProfesor,
  actualizarLinkZoom,
  obtenerClasesOnlineDisponibles,
} from "../services/clase-online.service.js";

export const generarClasesOnline = async (req, res) => {
  try {
    const { profesorId } = req.params;

    if (!profesorId) {
      return res.status(400).json({
        success: false,
        message: "profesorId es requerido",
      });
    }

    const resultado = await generarClasesOnlineService(parseInt(profesorId));

    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error generando clases online:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al generar clases online",
    });
  }
};

export const obtenerMisClasesOnline = async (req, res) => {
  try {
    const { profesorId } = req.params;

    if (!profesorId) {
      return res.status(400).json({
        success: false,
        message: "profesorId es requerido",
      });
    }

    const clases = await obtenerClasesOnlineProfesor(parseInt(profesorId));

    res.status(200).json({
      success: true,
      data: clases,
    });
  } catch (error) {
    console.error("Error obteniendo clases online:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener clases online",
    });
  }
};

export const generarLinkZoom = async (req, res) => {
  try {
    const { claseOnlineId } = req.params;
    const { linkZoom } = req.body;

    if (!claseOnlineId || !linkZoom) {
      return res.status(400).json({
        success: false,
        message: "claseOnlineId y linkZoom son requeridos",
      });
    }

    const actualizado = await actualizarLinkZoom(parseInt(claseOnlineId), linkZoom);

    if (actualizado) {
      res.status(200).json({
        success: true,
        message: "Link Zoom actualizado correctamente",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Clase online no encontrada",
      });
    }
  } catch (error) {
    console.error("Error actualizando link Zoom:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al actualizar link Zoom",
    });
  }
};

export const obtenerClasesDisponibles = async (req, res) => {
  try {
    const { profesorId } = req.params;
    const { diaSemana } = req.query;

    if (!profesorId || !diaSemana) {
      return res.status(400).json({
        success: false,
        message: "profesorId y diaSemana son requeridos",
      });
    }

    const clases = await obtenerClasesOnlineDisponibles(
      parseInt(profesorId),
      diaSemana.toLowerCase()
    );

    res.status(200).json({
      success: true,
      data: clases,
    });
  } catch (error) {
    console.error("Error obteniendo clases disponibles:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al obtener clases disponibles",
    });
  }
};
