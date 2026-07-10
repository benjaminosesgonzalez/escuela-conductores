import {
  obtenerArchivosProfesor,
  asignarMaterialAClasesDelDia,
  obtenerMaterialesDeClase,
  eliminarMaterialDeClase,
} from "../services/clase-material.service.js";

export const obtener_archivos_profesor = async (req, res) => {
  try {
    const { profesorId } = req.params;

    if (!profesorId) {
      return res.status(400).json({
        success: false,
        message: "profesorId es requerido",
      });
    }

    const archivos = await obtenerArchivosProfesor(parseInt(profesorId));

    res.json({
      success: true,
      archivos,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener archivos",
      error: error.message,
    });
  }
};

export const asignar_material_a_clases = async (req, res) => {
  try {
    const { profesorId, fechaDia, repositorioArchivoId } = req.body;

    if (!profesorId || !fechaDia || !repositorioArchivoId) {
      return res.status(400).json({
        success: false,
        message: "profesorId, fechaDia y repositorioArchivoId son requeridos",
      });
    }

    const result = await asignarMaterialAClasesDelDia(
      profesorId,
      fechaDia,
      repositorioArchivoId
    );

    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al asignar material",
      error: error.message,
    });
  }
};

export const obtener_materiales_clase = async (req, res) => {
  try {
    const { claseId } = req.params;

    if (!claseId) {
      return res.status(400).json({
        success: false,
        message: "claseId es requerido",
      });
    }

    const materiales = await obtenerMaterialesDeClase(parseInt(claseId));

    res.json({
      success: true,
      materiales,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener materiales",
      error: error.message,
    });
  }
};

export const eliminar_material_clase = async (req, res) => {
  try {
    const { claseId, archivoId } = req.body;

    if (!claseId || !archivoId) {
      return res.status(400).json({
        success: false,
        message: "claseId y archivoId son requeridos",
      });
    }

    const result = await eliminarMaterialDeClase(claseId, archivoId);

    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar material",
      error: error.message,
    });
  }
};
