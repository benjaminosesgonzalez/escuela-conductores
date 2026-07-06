import * as secretariaService from "../services/secretaria.service.js";

export const getSecretarias = async (req, res) => {
  try {
    const data = await secretariaService.getSecretariasService();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSecretaria = async (req, res) => {
  try {
    const updated = await secretariaService.updateSecretariaService(
      req.params.id,
      req.body,
    );
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Secretaria no encontrada" });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSecretaria = async (req, res) => {
  try {
    const result = await secretariaService.deleteSecretariaService(
      req.params.id,
    );
    if (!result)
      return res
        .status(404)
        .json({ success: false, message: "Secretaria no encontrada" });
    res.json({
      success: true,
      message: "Secretaria y cuenta de usuario eliminadas correctamente",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
