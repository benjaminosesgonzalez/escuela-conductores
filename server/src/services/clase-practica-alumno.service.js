import { AppDataSource } from "../config/configDb.js";
import { ClasePracticaSchema } from "../entities/clase-practica.entity.js";

const clasePracticaRepository = AppDataSource.getRepository(ClasePracticaSchema);

// Helper: obtener ID del alumno usando el ID del usuario
const obtenerIdAlumno = async (userId) => {
  const resultado = await AppDataSource.query(
    `SELECT id FROM alumnos WHERE id_user = $1`,
    [userId]
  );
  return resultado.length > 0 ? resultado[0].id : null;
};

/**
 * Obtener clases prácticas disponibles (sin alumno inscrito)
 */
export const obtenerClasesPracticasDisponibles = async (semanaActual = 0) => {
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

    // Obtener la hora actual del servidor para filtrar clases pasadas
    const ahora = new Date();
    const horaActual = String(ahora.getHours()).padStart(2, '0') + ':' +
                       String(ahora.getMinutes()).padStart(2, '0');
    const fechaActual = lunesStr(ahora);

    // Obtener clases prácticas disponibles (sin alumno, estado=disponible)
    const clases = await AppDataSource.query(
      `SELECT
        cp.id,
        cp."profesorId",
        cp."diaSemana",
        cp.fecha,
        cp."horaInicio",
        cp."horaFin",
        cp."alumnoId",
        cp.estado,
        p.nombre as "nombreProfesor"
      FROM clases_practicas cp
      LEFT JOIN profesores p ON cp."profesorId" = p.id
      WHERE cp.estado = 'disponible'
        AND cp."alumnoId" IS NULL
        AND cp.fecha >= $1
        AND cp.fecha <= $2
        AND (cp.fecha > $3 OR (cp.fecha = $3 AND cp."horaFin" > $4))
      ORDER BY cp.fecha, cp."horaInicio"`,
      [fechaInicio, fechaFin, fechaActual, horaActual]
    );

    return {
      success: true,
      semana: semanaActual,
      fechaInicio,
      fechaFin,
      clases: clases,
    };
  } catch (error) {
    console.error("Error obteniendo clases prácticas disponibles:", error);
    throw error;
  }
};

/**
 * Inscribir alumno en clase práctica (1 cupo, auto-ocupada)
 */
export const inscribirAlumnoEnClasePractica = async (clasePracticaId, userId) => {
  try {
    // Obtener ID real del alumno usando el ID del usuario
    const alumnoId = await obtenerIdAlumno(userId);

    if (!alumnoId) {
      return {
        success: false,
        message: "No se encontró el alumno asociado a tu usuario",
      };
    }

    // Verificar si la clase existe y está disponible
    const clasePractica = await clasePracticaRepository.findOne({
      where: {
        id: clasePracticaId,
        estado: "disponible",
        alumnoId: null,
      },
    });

    if (!clasePractica) {
      return {
        success: false,
        message: "La clase no está disponible o ya ha sido reservada",
      };
    }

    // Actualizar: asignar alumno y marcar como ocupada
    await clasePracticaRepository.update(
      { id: clasePracticaId },
      {
        alumnoId,
        estado: "ocupada",
      }
    );

    console.log(`✅ Alumno ${alumnoId} inscrito en clase práctica ${clasePracticaId}`);

    return {
      success: true,
      message: "Inscripción en clase práctica completada",
      claseId: clasePracticaId,
    };
  } catch (error) {
    console.error("Error inscribiendo alumno en clase práctica:", error);
    throw error;
  }
};

/**
 * Desinscribirse de clase práctica
 */
export const desinscribirAlumnoDeClasePractica = async (clasePracticaId, userId) => {
  try {
    const alumnoId = await obtenerIdAlumno(userId);

    if (!alumnoId) {
      return {
        success: false,
        message: "No se encontró el alumno asociado a tu usuario",
      };
    }

    // Verificar que el alumno sea quien está inscrito
    const clasePractica = await clasePracticaRepository.findOne({
      where: { id: clasePracticaId, alumnoId },
    });

    if (!clasePractica) {
      return {
        success: false,
        message: "No estás inscrito en esta clase práctica",
      };
    }

    // Liberar la clase (marcar como disponible nuevamente)
    await clasePracticaRepository.update(
      { id: clasePracticaId },
      {
        alumnoId: null,
        estado: "disponible",
      }
    );

    console.log(`✅ Alumno ${alumnoId} desinscrito de clase práctica ${clasePracticaId}`);

    return {
      success: true,
      message: "Desinscripción completada",
    };
  } catch (error) {
    console.error("Error desinscribiendo alumno de clase práctica:", error);
    throw error;
  }
};

/**
 * Obtener mis clases prácticas inscritas
 */
export const obtenerMisClasesPracticasAlumno = async (userId) => {
  try {
    const alumnoId = await obtenerIdAlumno(userId);

    if (!alumnoId) {
      return {
        success: false,
        clases: [],
        message: "No se encontró el alumno asociado a tu usuario",
      };
    }

    const clases = await AppDataSource.query(
      `SELECT
        cp.id,
        cp."profesorId",
        cp."diaSemana",
        cp.fecha,
        cp."horaInicio",
        cp."horaFin",
        cp.estado,
        p.nombre as "nombreProfesor"
      FROM clases_practicas cp
      LEFT JOIN profesores p ON cp."profesorId" = p.id
      WHERE cp."alumnoId" = $1
      ORDER BY cp.fecha DESC, cp."horaInicio" DESC`,
      [alumnoId]
    );

    return {
      success: true,
      clases: clases,
    };
  } catch (error) {
    console.error("Error obteniendo mis clases prácticas:", error);
    throw error;
  }
};
