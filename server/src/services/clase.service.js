import { AppDataSource } from "../config/configDb.js";
import { Clase } from "../entities/clase.entity.js";
import { Alumno } from "../entities/alumno.entity.js";
import { DisponibilidadAlumno } from "../entities/disponibilidad-alumno.entity.js";

// Obtener alumnos con disponibilidades seleccionadas (disponible: true)
export const obtenerAlumnosConDisponibilidades = async () => {
  try {
    const disponibilidadAlumnoRepository = AppDataSource.getRepository(DisponibilidadAlumno);
    const alumnoRepository = AppDataSource.getRepository(Alumno);

    // Obtener todas las disponibilidades seleccionadas (true)
    const disponibilidades = await disponibilidadAlumnoRepository.find({
      where: { disponible: true },
      order: {
        alumnoId: "ASC",
        diaSemana: "ASC",
        horaInicio: "ASC",
      },
    });

    // Agrupar por alumno
    const alumnosPorDisp = {};
    for (const disp of disponibilidades) {
      if (!alumnosPorDisp[disp.alumnoId]) {
        const alumno = await alumnoRepository.findOneBy({ id: disp.alumnoId });
        alumnosPorDisp[disp.alumnoId] = {
          alumno,
          disponibilidades: [],
        };
      }
      alumnosPorDisp[disp.alumnoId].disponibilidades.push(disp);
    }

    return Object.values(alumnosPorDisp);
  } catch (error) {
    console.error("Error obtener alumnos con disponibilidades:", error);
    throw error;
  }
};

// Crear una clase
export const crearClaseService = async (alumnoId, profesorId, diaSemana, horaInicio, horaFin) => {
  try {
    const claseRepository = AppDataSource.getRepository(Clase);
    const disponibilidadAlumnoRepository = AppDataSource.getRepository(DisponibilidadAlumno);

    const clase = claseRepository.create({
      alumnoId,
      profesorId,
      diaSemana,
      horaInicio,
      horaFin,
      estado: "confirmada",
    });

    const saved = await claseRepository.save(clase);

    // Marcar la disponibilidad como no disponible (false) después de agendar
    await disponibilidadAlumnoRepository.update(
      {
        alumnoId,
        diaSemana,
        horaInicio,
        horaFin,
      },
      { disponible: false }
    );

    return saved;
  } catch (error) {
    console.error("Error creando clase:", error);
    throw error;
  }
};

// Obtener clases de un alumno
export const obtenerClasesAlumnoService = async (alumnoId) => {
  try {
    const claseRepository = AppDataSource.getRepository(Clase);
    return await claseRepository.find({
      where: { alumnoId },
      relations: ["profesor"],
      order: {
        diaSemana: "ASC",
        horaInicio: "ASC",
      },
    });
  } catch (error) {
    console.error("Error obtener clases del alumno:", error);
    throw error;
  }
};

// Obtener clases de un profesor
export const obtenerClasesProfesorService = async (profesorId) => {
  try {
    const claseRepository = AppDataSource.getRepository(Clase);
    return await claseRepository.find({
      where: { profesorId },
      relations: ["alumno"],
      order: {
        diaSemana: "ASC",
        horaInicio: "ASC",
      },
    });
  } catch (error) {
    console.error("Error obtener clases del profesor:", error);
    throw error;
  }
};
