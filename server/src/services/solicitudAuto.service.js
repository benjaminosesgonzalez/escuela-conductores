import { AppDataSource } from "../config/configDb.js";
import { SolicitudAuto } from "../entities/solicitudAuto.entity.js";
import { Alumno } from "../entities/alumno.entity.js";

const solicitudRepo = AppDataSource.getRepository(SolicitudAuto);

export const crearSolicitudService = async (idUser, rol, data) => {
  const alumnoRepo = AppDataSource.getRepository(Alumno);
  const solicitudRepo = AppDataSource.getRepository(SolicitudAuto);

  // 1. Regla de negocio para alumnos
  if (rol === "alumno") {
    const alumno = await alumnoRepo.findOneBy({ id_user: idUser });
    if (!alumno || alumno.estado_matricula !== "finalizado") {
      throw new Error(
        "Solo los alumnos con curso finalizado pueden solicitar auto para examen.",
      );
    }
  }

  // 2. Extraemos el id_sede del body
  const { id_sede, ...datosSolicitud } = data;

  // 3. Creamos la solicitud vinculando los objetos de relación
  const nuevaSolicitud = solicitudRepo.create({
    ...datosSolicitud,
    tipo_solicitante: rol,
    estado: "pendiente",
    // IMPORTANTE: Mapeamos los IDs a los objetos que espera la entidad
    user: { id: idUser },
    sede: id_sede ? { id: parseInt(id_sede) } : null,
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

export const getSolicitudByIdService = async (id) => {
  return await solicitudRepo.findOne({
    where: { id: parseInt(id) },
    relations: ["sede"],
  });
};

export const getSolicitudesByUserService = async (idUser) => {
  return await solicitudRepo.find({
    where: { user: { id: idUser } },
    relations: ["sede"], // Para que el profe vea en qué sede pidió
    order: { fecha_creacion: "DESC" }, // Las más recientes primero
  });
};

export const cancelarSolicitudService = async (idSolicitud, idUser) => {
  const solicitud = await solicitudRepo.findOne({
    where: { id: idSolicitud, user: { id: idUser } },
  });

  if (!solicitud) {
    throw new Error(
      "La solicitud no existe o no tienes permiso para cancelarla.",
    );
  }

  // Regla de oro: Si la secretaria ya la aceptó o rechazó, no se puede borrar así como así
  if (solicitud.estado !== "pendiente") {
    throw new Error(
      `No puedes cancelar una solicitud que ya ha sido ${solicitud.estado}.`,
    );
  }

  return await solicitudRepo.remove(solicitud);
};
