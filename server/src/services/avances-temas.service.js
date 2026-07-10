import { AppDataSource } from "../config/configDb.js";
import { AvancesTemasSchema } from "../entities/AvancesTemas.js";
import { RegistrosAsistenciaClasesOnlineSchema } from "../entities/RegistrosAsistenciaClasesOnline.js";
import { ClaseOnlineSchema } from "../entities/clase-online.entity.js";

export const generarAvancesAlumno = async (idAlumno) => {
  try {
    for (let tema = 1; tema <= 10; tema++) {
      await avancesRepository.save({
        id_alumno: idAlumno,
        id_tema: tema,
        completado: false,
      });
    }
    return { success: true, message: "Avances creados correctamente" };
  } catch (error) {
    console.error("Error generando avances:", error);
    throw error;
  }
};

export const registrarAsistenciaClase = async (idClaseOnline, alumnosAsistieron) => {
  try {
    const claseRepository = AppDataSource.getRepository(ClaseOnlineSchema);
    const clase = await claseRepository.findOne({
      where: { id: idClaseOnline },
    });

    if (!clase) {
      throw new Error("Clase no encontrada");
    }

    const tema = clase.numeroTema;
    const avancesRepository = AppDataSource.getRepository(AvancesTemasSchema);
    const registrosRepository = AppDataSource.getRepository(RegistrosAsistenciaClasesOnlineSchema);

    for (const idAlumno of alumnosAsistieron) {
      await registrosRepository.save({
        claseOnlineId: idClaseOnline,
        alumnoId: idAlumno,
        asistio: true,
      });

      await avancesRepository.update(
        { id_alumno: idAlumno, id_tema: tema },
        { completado: true, fecha_completado: new Date() }
      );
    }

    return { success: true, message: "Asistencia registrada correctamente" };
  } catch (error) {
    console.error("Error registrando asistencia:", error);
    throw error;
  }
};

export const obtenerAvancesAlumno = async (idAlumno) => {
  try {
    const avancesRepository = AppDataSource.getRepository(AvancesTemasSchema);
    const avances = await avancesRepository.find({
      where: { id_alumno: idAlumno },
      order: { id_tema: "ASC" },
    });

    return avances;
  } catch (error) {
    console.error("Error obteniendo avances:", error);
    throw error;
  }
};

export const verificarPuedeReservarPracticas = async (idAlumno) => {
  try {
    const avancesRepository = AppDataSource.getRepository(AvancesTemasSchema);
    const avances = await avancesRepository.find({
      where: { id_alumno: idAlumno },
    });

    const tema1Completado = avances.some(
      (a) => a.id_tema === 1 && a.completado === true
    );
    const tema2Completado = avances.some(
      (a) => a.id_tema === 2 && a.completado === true
    );
    const tema3Completado = avances.some(
      (a) => a.id_tema === 3 && a.completado === true
    );

    const todosCompletados =
      tema1Completado && tema2Completado && tema3Completado;

    return {
      puede_reservar: todosCompletados,
      temas_completados: [
        tema1Completado,
        tema2Completado,
        tema3Completado,
      ],
    };
  } catch (error) {
    console.error("Error verificando si puede reservar:", error);
    throw error;
  }
};

export const obtenerClasesCompletadas = async (idAlumno) => {
  try {
    const registrosRepository = AppDataSource.getRepository(RegistrosAsistenciaClasesOnlineSchema);
    const registros = await registrosRepository.find({
      where: {
        alumnoId: idAlumno,
        asistio: true,
      },
    });

    const claseRepository = AppDataSource.getRepository(ClaseOnlineSchema);

    const clasesCompletadas = await Promise.all(
      registros.map(async (registro) => {
        const clase = await claseRepository.findOne({
          where: { id: registro.claseOnlineId },
        });

        if (!clase) return null;

        return {
          id_clase: clase.id,
          numeroTema: clase.numeroTema,
          nombreTema: clase.nombreTema,
          fecha: registro.fechaRegistro,
          profesorId: clase.profesorId,
        };
      })
    );

    return clasesCompletadas.filter(c => c !== null);
  } catch (error) {
    console.error("Error obteniendo clases completadas:", error);
    throw error;
  }
};
