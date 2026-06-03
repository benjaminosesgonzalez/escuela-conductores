import { AppDataSource } from "../config/configDb.js";
import { SolicitudAuto } from "../entities/solicitudAuto.entity.js";
import { Alumno } from "../entities/alumno.entity.js";

const solicitudRepo = AppDataSource.getRepository(SolicitudAuto);

export const crearSolicitudService = async (idUser, rol, data) => {
  // Regla: Si es alumno, verificar que esté finalizado
  if (rol === "alumno") {
    const alumno = await AppDataSource.getRepository(Alumno).findOneBy({
      id_user: idUser,
    });
    if (!alumno || alumno.estado_matricula !== "finalizado") {
      throw new Error(
        "Solo los alumnos con curso finalizado pueden solicitar auto para examen.",
      );
    }
  }

  const nuevaSolicitud = solicitudRepo.create({
    ...data,
    id_user: idUser,
    tipo_solicitante: rol,
    estado: "pendiente",
  });

  return await solicitudRepo.save(nuevaSolicitud);
};

export const getSolicitudesPorSedeService = async (idSede) => {
  return await solicitudRepo.find({
    where: { sede: { id: idSede } },
    relations: ["user", "sede"],
    order: { fecha_creacion: "DESC" },
  });
};

export const responderSolicitudService = async (idSolicitud, nuevoEstado) => {
  const solicitud = await solicitudRepo.findOneBy({ id: idSolicitud });
  if (!solicitud) return null;

  solicitud.estado = nuevoEstado; // "aceptado" o "rechazado"
  return await solicitudRepo.save(solicitud);
};

export const verificarDisponibilidadBloque = async (
  idSede,
  fecha,
  horaInicio,
  horaFin,
) => {
  const autoRepo = AppDataSource.getRepository("Auto");
  const solicitudRepo = AppDataSource.getRepository("SolicitudAuto");

  // 1. ¿Cuántos autos tiene la sede en total (que no estén en mantenimiento)?
  const totalAutosSede = await autoRepo.count({
    where: { sede: { id: idSede }, estado: "disponible" },
  });

  // 2. ¿Cuántas solicitudes ACEPTADAS hay que se solapen con este horario?
  // Usamos una consulta un poco más avanzada para ver solapamientos
  const solicitudesOcupadas = await solicitudRepo
    .createQueryBuilder("solicitud")
    .where("solicitud.id_sede = :idSede", { idSede })
    .andWhere("solicitud.fecha_uso = :fecha", { fecha })
    .andWhere("solicitud.estado = 'aceptado'")
    .andWhere(
      ":horaInicio < solicitud.hora_termino AND :horaFin > solicitud.hora_uso",
      {
        horaInicio,
        horaFin,
      },
    )
    .getCount();

  return {
    total: totalAutosSede,
    ocupados: solicitudesOcupadas,
    disponibles: totalAutosSede - solicitudesOcupadas,
    hayCupo: totalAutosSede - solicitudesOcupadas > 0,
  };
};
