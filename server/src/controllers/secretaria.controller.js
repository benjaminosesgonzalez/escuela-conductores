import * as secretariaService from "../services/secretaria.service.js";

// Registrar nueva secretaria
export const registrarSecretaria = async (req, res) => {
  try {
    const { email, password, nombre, telefono } = req.body;

    const secretaria = await secretariaService.registrarSecretariaService({
      email,
      password,
      nombre,
      telefono
    });

    res.status(201).json({
      success: true,
      message: "Secretaria registrada correctamente.",
      data: secretaria
    });
  } catch (error) {
    console.error("Error al registrar secretaria:", error);
    res.status(500).json({
      success: false,
      message: "Error al registrar secretaria.",
      error: error.message
    });
  }
};

// Obtener todas las secretarias
export const getSecretarias = async (req, res) => {
  try {
    const data = await secretariaService.getSecretariasService();

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener secretaria por ID
export const getSecretariaById = async (req, res) => {
  try {
    const data = await secretariaService.getSecretariaByIdService(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Secretaria no encontrada"
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Actualizar secretaria
export const updateSecretaria = async (req, res) => {
  try {
    const updated = await secretariaService.updateSecretariaService(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Secretaria no encontrada"
      });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Eliminar secretaria
export const deleteSecretaria = async (req, res) => {
  try {
    const result = await secretariaService.deleteSecretariaService(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Secretaria no encontrada"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Secretaria y cuenta de usuario eliminadas correctamente"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
