import { AppDataSource } from "../config/configDb.js";
import { SolicitudAuto } from "../entities/solicitudAuto.entity.js";
import { Alumno } from "../entities/alumno.entity.js";

const solicitudRepo = AppDataSource.getRepository(SolicitudAuto);

export const crearSolicitudService = async (idUser, rol, data) => {
  const alumnoRepo = AppDataSource.getRepository(Alumno);
  const solicitudRepo = AppDataSource.getRepository(SolicitudAuto);

  if (rol === "alumno") {
    const alumno = await alumnoRepo.findOneBy({ id_user: idUser });
    if (!alumno || alumno.estado_matricula !== "finalizado") {
      throw new Error(
        "Solo los alumnos con curso finalizado pueden solicitar auto para examen.",
      );
    }
  }

  const { id_sede, ...datosSolicitud } = data;

  const nuevaSolicitud = solicitudRepo.create({
    ...datosSolicitud,
    tipo_solicitante: rol,
    estado: "pendiente",
    user: { id: idUser },
    sede: id_sede ? { id: parseInt(id_sede) } : null,
  });

  return await solicitudRepo.save(nuevaSolicitud);
};

export const getSolicitudesPorSedeService = async (idSede) => {
  return await solicitudRepo.find({
    where: { sede: { id: idSede } },
    relations: ["user", "sede","auto"],
    order: { fecha_creacion: "DESC" },
  });
};

export const getAutosDisponiblesParaBloqueService = async (idSolicitud) => {
  const solicitudRepo = AppDataSource.getRepository("SolicitudAuto");
  const autoRepo = AppDataSource.getRepository("Auto");

  const solicitud = await solicitudRepo.findOne({ where: { id: parseInt(idSolicitud) }, relations: ["sede"] });
  if (!solicitud) throw new Error("Solicitud no encontrada");

  // 1. Obtener todos los autos operativos en esa sede
  const autosSede = await autoRepo.find({ where: { sede: { id: solicitud.sede.id }, estado: "disponible" } });

  // 2. Obtener todas las solicitudes aceptadas para ese mismo día y sede
  const solicitudesAceptadas = await solicitudRepo.find({
    where: { 
      sede: { id: solicitud.sede.id }, 
      fecha_uso: solicitud.fecha_uso, 
      estado: "aceptado" 
    },
    relations: ["auto"]
  });

  // Función auxiliar para convertir "HH:MM:SS" a minutos totales
  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
  };

  const reqInicioMin = timeToMinutes(solicitud.hora_uso);
  const reqFinMin = timeToMinutes(solicitud.hora_termino);

  // 3. Filtrar qué autos están ocupados (considerando 1 hora extra / 60 mins de buffer)
  const autosOcupadosIds = solicitudesAceptadas.filter(sol => {
    const solInicioMin = timeToMinutes(sol.hora_uso);
    const solFinBufferMin = timeToMinutes(sol.hora_termino) + 60; // <--- LA HORA EXTRA DE DESCANSO

    // Fórmula de solapamiento: (InicioA < FinB) y (FinA > InicioB)
    return (solInicioMin < reqFinMin) && (solFinBufferMin > reqInicioMin);
  }).map(sol => sol.auto?.id).filter(id => id !== undefined);

  // 4. Retornar solo los autos que NO están en la lista de ocupados
  return autosSede.filter(auto => !autosOcupadosIds.includes(auto.id));
};


export const responderSolicitudService = async (idSolicitud, estado, idAuto = null, motivoRechazo = null) => {
  const solicitudRepo = AppDataSource.getRepository("SolicitudAuto");
  const solicitud = await solicitudRepo.findOneBy({ id: parseInt(idSolicitud) });
  
  if (!solicitud) return null;

  // Asignamos el estado
  solicitud.estado = estado;
  
  // Lógica si es aceptado
  if (estado === "aceptado" && idAuto) {
    solicitud.auto = { id: parseInt(idAuto) }; 
  }
  
  // Lógica si es rechazado (Reutilizando la columna 'detalles' de forma segura)
  if (estado === "rechazado" && motivoRechazo) {
    const textoAnterior = solicitud.detalles ? `${solicitud.detalles} | ` : "";
    solicitud.detalles = `${textoAnterior}Motivo de rechazo: ${motivoRechazo}`;
  }
  
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

  const totalAutosSede = await autoRepo.count({
    where: { sede: { id: idSede }, estado: "disponible" },
  });

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
    relations: ["sede", "auto"],
    order: { fecha_creacion: "DESC" },
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

  if (solicitud.estado !== "pendiente") {
    throw new Error(
      `No puedes cancelar una solicitud que ya ha sido ${solicitud.estado}.`,
    );
  }

  return await solicitudRepo.remove(solicitud);
};
