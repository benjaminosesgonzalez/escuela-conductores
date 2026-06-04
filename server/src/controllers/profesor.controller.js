import * as profService from "../services/profesor.service.js";

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
