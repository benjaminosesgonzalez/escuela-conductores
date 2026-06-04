import * as autoService from "../services/auto.service.js";

export const createAuto = async (req, res) => {
  try {
    const data = await autoService.createAutoService(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAutos = async (req, res) => {
  try {
    const data = await autoService.getAutosService();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDisponibilidadSede = async (req, res) => {
  try {
    const { idSede } = req.params;
    const data = await autoService.getAutosBySedeService(idSede);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAuto = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAuto = await autoService.updateAutoService(id, req.body);

    if (!updatedAuto) {
      return res.status(404).json({
        success: false,
        message: "Auto no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Auto actualizado exitosamente",
      data: updatedAuto,
    });
  } catch (error) {
    console.error("❌ Error al actualizar auto:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el auto",
      error: error.message,
    });
  }
};

export const deleteAuto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await autoService.deleteAutoService(id);

    if (result.affected === 0) {
      return res.status(404).json({
        success: false,
        message: "Auto no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Auto eliminado correctamente de la flota",
    });
  } catch (error) {
    console.error("❌ Error al eliminar auto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el auto",
      error: error.message,
    });
  }
};
