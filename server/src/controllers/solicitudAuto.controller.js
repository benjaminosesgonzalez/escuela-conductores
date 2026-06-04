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
    const { estado } = req.body; // "aceptado" o "rechazado"

    // 1. Buscamos la solicitud primero para tener sus datos (fecha, hora, sede)
    const solicitud = await solicitudService.getSolicitudByIdService(id);

    if (!solicitud) {
      return res
        .status(404)
        .json({ success: false, message: "Solicitud no encontrada" });
    }

    // 2. Si la secretaria quiere ACEPTAR, validamos disponibilidad real
    if (estado === "aceptado") {
      const disponibilidad =
        await solicitudService.verificarDisponibilidadBloque(
          solicitud.sede.id, // Sacamos el ID de la relación que cargamos
          solicitud.fecha_uso,
          solicitud.hora_uso,
          solicitud.hora_termino,
        );

      if (!disponibilidad.hayCupo) {
        return res.status(400).json({
          success: false,
          message: `No hay autos disponibles. Ocupados: ${disponibilidad.ocupados}/${disponibilidad.total}`,
        });
      }
    }

    // 3. Si todo está bien o es un rechazo, actualizamos
    const result = await solicitudService.responderSolicitudService(id, estado);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error al responder solicitud:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listarMisSolicitudes = async (req, res) => {
  try {
    const idUser = req.user.id; // Extraído del token
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
    const idUser = req.user.id; // Del token, para asegurar que sea su propia solicitud

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
