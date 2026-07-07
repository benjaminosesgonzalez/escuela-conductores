import { AppDataSource } from "../config/configDb.js";
import { ClaseOnlineAlumnoSchema } from "../entities/clase-online-alumno.entity.js";

const claseOnlineAlumnoRepository = AppDataSource.getRepository(ClaseOnlineAlumnoSchema);

// Helper: obtener ID del alumno usando el ID del usuario
const obtenerIdAlumno = async (userId) => {
  const resultado = await AppDataSource.query(
    `SELECT id FROM alumnos WHERE id_user = $1`,
    [userId]
  );
  return resultado.length > 0 ? resultado[0].id : null;
};

export const inscribirAlumnoEnClaseOnline = async (claseOnlineId, userId) => {
  try {
    // Obtener ID real del alumno usando el ID del usuario
    const alumnoId = await obtenerIdAlumno(userId);

    if (!alumnoId) {
      return {
        success: false,
        message: "No se encontró el alumno asociado a tu usuario",
      };
    }

    // Verificar si ya está inscrito
    const existente = await claseOnlineAlumnoRepository.findOne({
      where: {
        claseOnlineId,
        alumnoId,
      },
    });

    if (existente) {
      return {
        success: false,
        message: "El alumno ya está inscrito en esta clase",
      };
    }

    // Verificar si la clase existe y tiene capacidad
    const claseOnline = await AppDataSource.query(
      `SELECT * FROM clases_online WHERE id = $1 AND estado = 'activa'`,
      [claseOnlineId]
    );

    if (claseOnline.length === 0) {
      return {
        success: false,
        message: "La clase no existe o no está activa",
      };
    }

    const clase = claseOnline[0];
    if (clase.alumnosAgendados >= clase.capacidadMaxima) {
      return {
        success: false,
        message: "La clase está llena",
      };
    }

    // Crear inscripción
    const inscripcion = claseOnlineAlumnoRepository.create({
      claseOnlineId,
      alumnoId,
      estado: "inscrito",
    });

    await claseOnlineAlumnoRepository.save(inscripcion);

    // Actualizar contador de alumnos agendados
    await AppDataSource.query(
      `UPDATE clases_online SET "alumnosAgendados" = "alumnosAgendados" + 1 WHERE id = $1`,
      [claseOnlineId]
    );

    return {
      success: true,
      message: "Inscripción completada",
      inscripcionId: inscripcion.id,
    };
  } catch (error) {
    console.error("Error inscribiendo alumno:", error);
    throw error;
  }
};

export const desinscribirAlumnoDeClaseOnline = async (
  claseOnlineId,
  userId
) => {
  try {
    // Obtener ID real del alumno usando el ID del usuario
    const alumnoId = await obtenerIdAlumno(userId);

    if (!alumnoId) {
      return {
        success: false,
        message: "No se encontró el alumno asociado a tu usuario",
      };
    }

    // Buscar y eliminar inscripción
    const inscripcion = await claseOnlineAlumnoRepository.findOne({
      where: {
        claseOnlineId,
        alumnoId,
      },
    });

    if (!inscripcion) {
      return {
        success: false,
        message: "El alumno no está inscrito en esta clase",
      };
    }

    await claseOnlineAlumnoRepository.delete(inscripcion.id);

    // Actualizar contador de alumnos agendados
    await AppDataSource.query(
      `UPDATE clases_online SET "alumnosAgendados" = "alumnosAgendados" - 1 WHERE id = $1`,
      [claseOnlineId]
    );

    return {
      success: true,
      message: "Desinscripción completada",
    };
  } catch (error) {
    console.error("Error desinscribiendo alumno:", error);
    throw error;
  }
};

export const obtenerClasesOnlineDisponibles = async (semanaActual = 0) => {
  try {
    // Calcular fechas de la semana solicitada
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diasAlLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunesActual = new Date(hoy);
    lunesActual.setDate(hoy.getDate() + diasAlLunes);

    const lunesStr = (fecha) => {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, "0");
      const day = String(fecha.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const semanaInicio = new Date(lunesActual);
    semanaInicio.setDate(lunesActual.getDate() + semanaActual * 7);

    const semanaFin = new Date(semanaInicio);
    semanaFin.setDate(semanaInicio.getDate() + 4); // Viernes

    const fechaInicio = lunesStr(semanaInicio);
    const fechaFin = lunesStr(semanaFin);

    const clases = await AppDataSource.query(
      `SELECT
        co.id,
        co."profesorId",
        co."numeroTema",
        co."nombreTema",
        co."diaSemana",
        co.fecha,
        co."horaInicio",
        co."horaFin",
        co."capacidadMaxima",
        co."alumnosAgendados",
        co.estado,
        p.nombre as "nombreProfesor"
      FROM clases_online co
      LEFT JOIN profesores p ON co."profesorId" = p.id
      WHERE co.estado = 'activa'
        AND co.fecha >= $1
        AND co.fecha <= $2
      ORDER BY co.fecha, co."horaInicio"`,
      [fechaInicio, fechaFin]
    );

    return {
      success: true,
      semana: semanaActual,
      fechaInicio,
      fechaFin,
      clases: clases.map((c) => ({
        ...c,
        lugaresDisponibles: c.capacidadMaxima - c.alumnosAgendados,
      })),
    };
  } catch (error) {
    console.error("Error obteniendo clases disponibles:", error);
    throw error;
  }
};

export const obtenerMisClasesOnlineAlumno = async (userId) => {
  try {
    // Obtener ID real del alumno usando el ID del usuario
    const alumnoId = await obtenerIdAlumno(userId);

    if (!alumnoId) {
      return {
        success: false,
        proximas: [],
        completadas: [],
        canceladas: [],
        message: "No se encontró el alumno asociado a tu usuario",
      };
    }

    const clases = await AppDataSource.query(
      `SELECT
        co.id,
        co."profesorId",
        co."numeroTema",
        co."nombreTema",
        co."diaSemana",
        co.fecha,
        co."horaInicio",
        co."horaFin",
        co."capacidadMaxima",
        co."alumnosAgendados",
        co."linkZoom",
        co.estado,
        coa.estado as "estadoInscripcion",
        p.nombre as "nombreProfesor"
      FROM clase_online_alumno coa
      JOIN clases_online co ON coa."claseOnlineId" = co.id
      LEFT JOIN profesores p ON co."profesorId" = p.id
      WHERE coa."alumnoId" = $1
      ORDER BY co.fecha, co."horaInicio"`,
      [alumnoId]
    );

    // Agrupar por estado y semana
    const agrupado = {
      proximas: [],
      completadas: [],
      canceladas: [],
    };

    const ahora = new Date();

    clases.forEach((clase) => {
      const fecha = new Date(clase.fecha);
      const horaFin = clase.horaFin.split(":");
      fecha.setHours(
        parseInt(horaFin[0]),
        parseInt(horaFin[1]),
        0,
        0
      );

      if (fecha > ahora && clase.estado === "activa") {
        agrupado.proximas.push(clase);
      } else if (clase.estado === "completada") {
        agrupado.completadas.push(clase);
      } else if (clase.estado === "cancelada") {
        agrupado.canceladas.push(clase);
      }
    });

    return {
      success: true,
      proximas: agrupado.proximas,
      completadas: agrupado.completadas,
      canceladas: agrupado.canceladas,
    };
  } catch (error) {
    console.error("Error obteniendo mis clases:", error);
    throw error;
  }
};

export const verificarInscripcion = async (claseOnlineId, userId) => {
  try {
    // Obtener ID real del alumno usando el ID del usuario
    const alumnoId = await obtenerIdAlumno(userId);

    if (!alumnoId) {
      return false;
    }

    const inscripcion = await claseOnlineAlumnoRepository.findOne({
      where: {
        claseOnlineId,
        alumnoId,
      },
    });

    return inscripcion ? true : false;
  } catch (error) {
    console.error("Error verificando inscripción:", error);
    throw error;
  }
};
