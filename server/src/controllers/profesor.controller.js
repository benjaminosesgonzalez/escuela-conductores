import * as profService from "../services/profesor.service.js";

export const registrarProfesor = async (req, res) => {
  try {
    const { email, password, nombre, telefono, tipo_contrato } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos."
      });
    }

    const profesor = await profService.registrarProfesorService({
      email,
      password,
      nombre,
      telefono,
      tipo_contrato
    });

    res.status(201).json({
      success: true,
      message: "Profesor registrado correctamente.",
      data: profesor
    });
  } catch (error) {
    console.error("Error al registrar profesor:", error);
    res.status(500).json({
      success: false,
      message: "Error al registrar profesor.",
      error: error.message
    });
  }
};

export const getProfesores = async (req, res) => {
  try {
    const profesores = await profService.getProfesoresService();
    res.json({ success: true, data: profesores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfesor = async (req, res) => {
  try {
    const updated = await profService.updateProfesorService(
      req.params.id,
      req.body,
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Profesor no encontrado" });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProfesor = async (req, res) => {
  try {
    const result = await profService.deleteProfesorService(req.params.id);
    if (!result)
      return res
        .status(404)
        .json({ success: false, message: "Profesor no encontrado" });
    res.json({ success: true, message: "Profesor y usuario eliminados" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const eliminarProfesoresMasivo = async (req, res) => {
  try {
    const profesoresIds = req.body.profesoresIds || req.body.profesores_ids;

    if (!profesoresIds || !Array.isArray(profesoresIds) || profesoresIds.length === 0) {
      return res.status(400).json({ success: false, message: "Debe proporcionar un array de IDs de profesores." });
    }

    const cantidadEliminada = await profService.eliminarProfesoresPorIdsService(profesoresIds);

    res.status(200).json({
      success: true,
      message: `Se han eliminado ${cantidadEliminada} profesor(es) correctamente.`
    });
  } catch (error) {
    console.error("Error al eliminar profesores:", error);
    res.status(500).json({ success: false, message: "Error interno al eliminar profesores." });
  }
};

export const resetPasswordProfesor = async (req, res) => {
  try {
    const nuevaPassword = await profService.resetPasswordProfesorService(req.params.id);
    
    if (!nuevaPassword) {
      return res.status(404).json({ success: false, message: "Profesor o usuario asociado no encontrado." });
    }

    res.status(200).json({ 
      success: true, 
      message: `Contraseña reiniciada exitosamente a: ${nuevaPassword}` 
    });
  } catch (error) {
    console.error("Error al reiniciar contraseña del profesor:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};
