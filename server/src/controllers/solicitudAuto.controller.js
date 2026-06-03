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

    if (estado === "aceptado") {
      const solicitud = await solicitudService.getSolicitudById(id);
      const disponibilidad =
        await solicitudService.verificarDisponibilidadBloque(
          solicitud.id_sede,
          solicitud.fecha_uso,
          solicitud.hora_uso,
          solicitud.hora_termino,
        );

      if (!disponibilidad.hayCupo) {
        return res.status(400).json({
          success: false,
          message:
            "No hay autos disponibles para este bloque horario. Debes rechazar o pedir cambio de hora.",
        });
      }
    }

    const result = await solicitudService.responderSolicitudService(id, estado);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
