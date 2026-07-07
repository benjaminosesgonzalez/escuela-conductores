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
 * Generar bloques de disponibilidad automáticos para un profesor según tipo de contrato
 * Full time: 9:00 AM - 7:45 PM (19:45)
 * Part time mañana: 9:00 AM - 2:00 PM (14:00)
 * Part time tarde: 2:00 PM - 8:00 PM (20:00)
 * Duración de clase: 45 minutos, Break: 15 minutos
 * @param {number} profesorId - ID del profesor
 * @param {string} tipoContrato - Tipo de contrato (full_time, part_time_morning, part_time_afternoon)
 * @param {array} diasLaboral - Días a generar
 */
export const generarBloquesDisponibilidad = async (
  profesorId,
  tipoContrato = "full_time",
  diasLaboral = ["lunes", "martes", "miércoles", "jueves", "viernes"]
) => {
  try {
    // Verificar si ya existen bloques generados
    const bloquesExistentes = await disponibilidadRepository.findOne({
      where: { profesorId }
    });

    // Si ya existen bloques, no eliminarlos. Solo retornar mensaje
    if (bloquesExistentes) {
      const totalBloques = await disponibilidadRepository.count({
        where: { profesorId }
      });
      return { success: true, bloques: totalBloques, message: "Bloques ya generados" };
    }

    const bloques = [];
    const duracionClaseMinutos = 45;
    const breakMinutos = 15;

    // Definir horarios según tipo de contrato
    let horaInicioMinutos, horaFinMinutos;

    switch (tipoContrato) {
      case "part_time_morning":
        horaInicioMinutos = 9 * 60; // 9:00 AM
        horaFinMinutos = 14 * 60; // 2:00 PM
        break;
      case "part_time_afternoon":
        horaInicioMinutos = 14 * 60; // 2:00 PM
        horaFinMinutos = 20 * 60; // 8:00 PM
        break;
      case "full_time":
      default:
        horaInicioMinutos = 9 * 60; // 9:00 AM
        horaFinMinutos = 19 * 60 + 45; // 7:45 PM
    }

    // Generar bloques para DOS semanas (semana actual + siguiente)
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diasAlLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunesActual = new Date(hoy);
    lunesActual.setDate(hoy.getDate() + diasAlLunes);

    // Generar para semana actual + siguiente (10 días laborales)
    for (let semana = 0; semana < 2; semana++) {
      for (const dia of diasLaboral) {
        const indice = diasLaboral.indexOf(dia);
        const fecha = new Date(lunesActual);
        fecha.setDate(lunesActual.getDate() + indice + (semana * 7));
        const fechaStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD

        let horaActual = horaInicioMinutos;

        while (horaActual + duracionClaseMinutos <= horaFinMinutos) {
          const inicio = minutosAHora(horaActual);
          const fin = minutosAHora(horaActual + duracionClaseMinutos);

          bloques.push({
            profesorId,
            diaSemana: dia,
            fecha: fechaStr,
            horaInicio: inicio,
            horaFin: fin,
            disponible: true,
          });

          horaActual += duracionClaseMinutos + breakMinutos;
        }
      }
    }

    // Guardar todos los bloques usando insert para asegurar que se guarden las fechas
    if (bloques.length > 0) {
      await disponibilidadRepository.insert(bloques);
    }
    return { success: true, bloques: bloques.length, message: `${bloques.length} bloques generados para 2 semanas` };
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
        fecha: "ASC",
        diaSemana: "ASC",
        horaInicio: "ASC",
      },
    });

    // Agrupar por día de la semana (pero mantener los datos de fecha para que el frontend los use)
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
export const actualizarDisponibilidad = async (id, disponible, fecha = null) => {
  try {
    const updateData = { disponible, updatedAt: new Date() };
    if (fecha) {
      updateData.fecha = fecha;
    }

    const resultado = await disponibilidadRepository.update(
      { id },
      updateData
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
