import * as solicitudService from "../services/solicitudAuto.service.js";

export const crearSolicitud = async (req, res) => {
  try {
    const idUser = req.user.id;
    const rol = req.user.rol;
    const data = await solicitudService.crearSolicitudService(
      idUser,
      rol,
      req.body,
    );
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const listarPorSede = async (req, res) => {
  try {
    const { idSede } = req.params;
    const solicitudes =
      await solicitudService.getSolicitudesPorSedeService(idSede);
    res.json({ success: true, data: solicitudes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const responderSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, id_auto, motivo_rechazo } = req.body; 

    const solicitud = await solicitudService.getSolicitudByIdService(id);
    if (!solicitud) {
      return res.status(404).json({ success: false, message: "Solicitud no encontrada" });
    }

    if (estado === "aceptado" && !id_auto) {
      return res.status(400).json({ success: false, message: "Debe seleccionar un vehículo para aprobar la solicitud." });
    }

    const result = await solicitudService.responderSolicitudService(id, estado, id_auto, motivo_rechazo);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listarMisSolicitudes = async (req, res) => {
  try {
    const idUser = req.user.id;
    const solicitudes =
      await solicitudService.getSolicitudesByUserService(idUser);

    res.json({
      success: true,
      count: solicitudes.length,
      data: solicitudes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const idUser = req.user.id;

    await solicitudService.cancelarSolicitudService(id, idUser);

    res.json({
      success: true,
      message: "Solicitud cancelada y eliminada exitosamente.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const obtenerAutosParaSolicitud = async (req, res) => {
  try {
    const autosLibres = await solicitudService.getAutosDisponiblesParaBloqueService(req.params.id);
    res.json({ success: true, data: autosLibres });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


