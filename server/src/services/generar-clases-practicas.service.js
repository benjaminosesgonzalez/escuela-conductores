import { AppDataSource } from "../config/configDb.js";

/**
 * Generar clases prácticas a partir de disponibilidades marcadas como "práctica"
 */
export const generarClasesPracticasDesdeDisponibilidades = async (profesorId) => {
  try {
    // Obtener disponibilidades del profesor con tipo "práctica"
    const disponibilidades = await AppDataSource.query(
      `SELECT id, "diaSemana", fecha, "horaInicio", "horaFin", "profesorId"
       FROM disponibilidades
       WHERE "profesorId" = $1
       AND "tipoDisponibilidad" = 'practica'
       AND disponible = true`,
      [profesorId]
    );

    if (disponibilidades.length === 0) {
      return { success: true, clasesCreadas: 0, message: "No hay disponibilidades de tipo práctica" };
    }

    let clasesCreadas = 0;

    // Para cada disponibilidad, crear una clase práctica si no existe
    for (const disp of disponibilidades) {
      // Verificar si ya existe una clase práctica para esa disponibilidad
      const claseExistente = await AppDataSource.query(
        `SELECT id FROM clases_practicas
         WHERE "profesorId" = $1
         AND fecha = $2
         AND "horaInicio" = $3
         AND "horaFin" = $4`,
        [disp.profesorId, disp.fecha, disp.horaInicio, disp.horaFin]
      );

      // Solo crear si no existe
      if (claseExistente.length === 0) {
        await AppDataSource.query(
          `INSERT INTO clases_practicas ("profesorId", "diaSemana", fecha, "horaInicio", "horaFin", estado)
           VALUES ($1, $2, $3, $4, $5, 'disponible')`,
          [disp.profesorId, disp.diaSemana, disp.fecha, disp.horaInicio, disp.horaFin]
        );
        clasesCreadas++;
      }
    }

    return {
      success: true,
      clasesCreadas,
      message: `${clasesCreadas} clase(s) práctica(s) generadas para el profesor ${profesorId}`
    };
  } catch (error) {
    console.error("Error generando clases prácticas:", error);
    throw error;
  }
};

/**
 * Generar clases prácticas para TODOS los profesores que tengan disponibilidades de tipo "práctica"
 */
export const generarTodasLasClasesPracticas = async () => {
  try {
    // Obtener IDs de profesores únicos que tienen disponibilidades de tipo "práctica"
    const profesores = await AppDataSource.query(
      `SELECT DISTINCT "profesorId"
       FROM disponibilidades
       WHERE "tipoDisponibilidad" = 'practica'
       AND disponible = true`
    );

    let totalClasesCreadas = 0;

    for (const prof of profesores) {
      const resultado = await generarClasesPracticasDesdeDisponibilidades(prof.profesorId);
      totalClasesCreadas += resultado.clasesCreadas;
    }

    return {
      success: true,
      totalClasesCreadas,
      message: `Total: ${totalClasesCreadas} clase(s) práctica(s) generadas para ${profesores.length} profesor(es)`
    };
  } catch (error) {
    console.error("Error generando todas las clases prácticas:", error);
    throw error;
  }
};
