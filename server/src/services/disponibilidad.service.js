import { AppDataSource } from "../config/configDb.js";
import { DisponibilidadSchema } from "../entities/disponibilidad.entity.js";

const disponibilidadRepository = AppDataSource.getRepository(DisponibilidadSchema);

// Función auxiliar para convertir minutos a formato HH:MM
const minutosAHora = (minutos) => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// Función auxiliar para convertir HH:MM a minutos desde medianoche
const horaAMinutos = (hora) => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Generar bloques de disponibilidad automáticos para un profesor
<<<<<<< Updated upstream
 * @param {number} profesorId - ID del profesor
 * @param {number} horaInicio - Hora inicio (ej: 9 para 09:00)
 * @param {number} horaFin - Hora fin (ej: 17 para 17:00)
 * @param {number} intervaloMinutos - Intervalo entre bloques (ej: 90 para 1.5 horas)
=======
 * Horario fijo: 9:00 AM - 7:45 PM (19:45)
 * Duración de clase: 45 minutos
 * Break entre clases: 15 minutos
 * @param {number} profesorId - ID del profesor
>>>>>>> Stashed changes
 * @param {array} diasLaboral - Días a generar (ej: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'])
 */
export const generarBloquesDisponibilidad = async (
  profesorId,
<<<<<<< Updated upstream
  horaInicio = 9,
  horaFin = 17,
  intervaloMinutos = 90,
=======
>>>>>>> Stashed changes
  diasLaboral = ["lunes", "martes", "miércoles", "jueves", "viernes"]
) => {
  try {
    // Eliminar disponibilidades anteriores
    await disponibilidadRepository.delete({ profesorId });

    const bloques = [];
<<<<<<< Updated upstream
    let horaActual = horaInicio * 60; // Convertir a minutos
    const hoaFinMinutos = horaFin * 60;

    // Generar bloques para cada día laboral
    for (const dia of diasLaboral) {
      horaActual = horaInicio * 60;

      while (horaActual + intervaloMinutos <= hoaFinMinutos) {
        const inicio = minutosAHora(horaActual);
        const fin = minutosAHora(horaActual + intervaloMinutos);
=======
    const horaInicioMinutos = 9 * 60; // 9:00 AM en minutos
    const horaFinMinutos = 19 * 60 + 45; // 7:45 PM en minutos
    const duracionClaseMinutos = 45;
    const breakMinutos = 15;

    // Generar bloques para cada día laboral
    for (const dia of diasLaboral) {
      let horaActual = horaInicioMinutos;

      // Generar bloques de 45 minutos hasta las 7:45 PM
      while (horaActual + duracionClaseMinutos <= horaFinMinutos) {
        const inicio = minutosAHora(horaActual);
        const fin = minutosAHora(horaActual + duracionClaseMinutos);
>>>>>>> Stashed changes

        const disponibilidad = disponibilidadRepository.create({
          profesorId,
          diaSemana: dia,
          horaInicio: inicio,
          horaFin: fin,
          disponible: true,
        });

        bloques.push(disponibilidad);
<<<<<<< Updated upstream
        horaActual += intervaloMinutos;
=======

        // Avanzar por la duración de la clase + el break (45 + 15 = 60 minutos)
        horaActual += duracionClaseMinutos + breakMinutos;
>>>>>>> Stashed changes
      }
    }

    // Guardar todos los bloques
    await disponibilidadRepository.save(bloques);
    return { success: true, bloques: bloques.length, message: "Bloques generados exitosamente" };
  } catch (error) {
    console.error("Error generando bloques de disponibilidad:", error);
    throw error;
  }
};

/**
 * Obtener disponibilidades de un profesor
 */
export const obtenerDisponibilidadesPorProfesor = async (profesorId) => {
  try {
    const disponibilidades = await disponibilidadRepository.find({
      where: { profesorId },
      order: {
        diaSemana: "ASC",
        horaInicio: "ASC",
      },
    });

    // Agrupar por día de la semana
    const agrupado = {
      lunes: [],
      martes: [],
      miércoles: [],
      jueves: [],
      viernes: [],
    };

    disponibilidades.forEach((disp) => {
      if (agrupado[disp.diaSemana]) {
        agrupado[disp.diaSemana].push(disp);
      }
    });

    return agrupado;
  } catch (error) {
    console.error("Error obteniendo disponibilidades:", error);
    throw error;
  }
};

/**
 * Actualizar disponibilidad de un bloque específico
 */
export const actualizarDisponibilidad = async (id, disponible) => {
  try {
    const resultado = await disponibilidadRepository.update(
      { id },
      { disponible, updatedAt: new Date() }
    );

    return resultado.affected > 0;
  } catch (error) {
    console.error("Error actualizando disponibilidad:", error);
    throw error;
  }
};

/**
 * Actualizar múltiples disponibilidades (ej: marcar varios bloques como disponibles)
 */
export const actualizarMultiplesDisponibilidades = async (ids, disponible) => {
  try {
    const resultado = await disponibilidadRepository
      .createQueryBuilder()
      .update()
      .set({ disponible, updatedAt: new Date() })
      .whereInIds(ids)
      .execute();

    return resultado.affected > 0;
  } catch (error) {
    console.error("Error actualizando múltiples disponibilidades:", error);
    throw error;
  }
};

/**
 * Obtener bloques disponibles por día específico
 */
export const obtenerDisponibilidadesPorDia = async (profesorId, dia) => {
  try {
    const disponibilidades = await disponibilidadRepository.find({
      where: { profesorId, diaSemana: dia },
      order: { horaInicio: "ASC" },
    });

    return disponibilidades;
  } catch (error) {
    console.error("Error obteniendo disponibilidades por día:", error);
    throw error;
  }
};

/**
 * Obtener todos los profesores disponibles en un horario específico
 */
export const obtenerProfesoresDisponibles = async (dia, horaInicio, horaFin) => {
  try {
    const disponibilidades = await disponibilidadRepository
      .createQueryBuilder("disponibilidad")
      .leftJoin("disponibilidad.profesor", "profesor")
      .select([
        "profesor.id",
        "profesor.nombre",
        "disponibilidad.id",
        "disponibilidad.diaSemana",
        "disponibilidad.horaInicio",
        "disponibilidad.horaFin",
      ])
      .where("disponibilidad.diaSemana = :dia", { dia })
      .andWhere("disponibilidad.disponible = :disponible", { disponible: true })
      .andWhere("disponibilidad.horaInicio >= :horaInicio", { horaInicio })
      .andWhere("disponibilidad.horaFin <= :horaFin", { horaFin })
      .getMany();

    return disponibilidades;
  } catch (error) {
    console.error("Error obteniendo profesores disponibles:", error);
    throw error;
  }
};

/**
 * Obtener configuración de horario para un profesor
 */
export const obtenerConfiguracionHorario = async (profesorId) => {
  try {
    const disponibilidades = await disponibilidadRepository.find({
      where: { profesorId },
    });

    if (disponibilidades.length === 0) {
      return null;
    }

    // Extraer horarios únicos
    const horas = disponibilidades.map((d) => horaAMinutos(d.horaInicio));
    const horaMinima = Math.min(...horas);
    const horaMaxima = Math.max(...horas);

    // Calcular intervalo
    let intervalo = null;
    if (disponibilidades.length > 1) {
      const duraciones = disponibilidades.map(
        (d) => horaAMinutos(d.horaFin) - horaAMinutos(d.horaInicio)
      );
      intervalo = duraciones[0]; // Asumir que todos tienen la misma duración
    }

    return {
      horaInicio: Math.floor(horaMinima / 60),
      horaFin: Math.ceil(horaMaxima / 60),
      intervaloMinutos: intervalo,
      totalBloques: disponibilidades.length,
    };
  } catch (error) {
    console.error("Error obteniendo configuración de horario:", error);
    throw error;
  }
};
