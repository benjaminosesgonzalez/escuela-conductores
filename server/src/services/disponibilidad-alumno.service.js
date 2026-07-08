import { AppDataSource } from "../config/configDb.js";
import { DisponibilidadAlumno } from "../entities/disponibilidad-alumno.entity.js";
import { Alumno } from "../entities/alumno.entity.js";

const disponibilidadAlumnoRepository = AppDataSource.getRepository(DisponibilidadAlumno);
const alumnoRepository = AppDataSource.getRepository(Alumno);

// Función auxiliar para convertir minutos a formato HH:MM
const minutosAHora = (minutos) => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// Función auxiliar para convertir HH:MM a minutos
const horaAMinutos = (hora) => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Generar bloques de disponibilidad automáticos para un alumno
 * Genera TODOS los bloques posibles en el horario (9 AM - 8 PM)
 * El alumno puede seleccionar hasta totalClases bloques
 * @param {number} alumnoId - ID del alumno
 * @param {number} totalClases - Total de clases que puede seleccionar (del plan) - solo informativo
 * @param {array} diasLaboral - Días a generar (default: lunes a viernes)
 */
export const generarBloquesDisponibilidadAlumnoService = async (
  alumnoId,
  totalClases,
  diasLaboral = ["lunes", "martes", "miércoles", "jueves", "viernes"]
) => {
  try {
    // Verificar que el alumno existe
    const alumno = await alumnoRepository.findOneBy({ id: alumnoId });
    if (!alumno) {
      throw new Error("Alumno no encontrado");
    }

    // Verificar si ya existen bloques generados
    const bloquesExistentes = await disponibilidadAlumnoRepository.findOne({
      where: { alumnoId }
    });

    // Si ya existen bloques, no eliminarlos. Solo retornar mensaje
    if (bloquesExistentes) {
      const totalBloques = await disponibilidadAlumnoRepository.count({
        where: { alumnoId }
      });
      return {
        success: true,
        bloques: totalBloques,
        totalSeleccionables: totalClases,
        message: `Bloques ya generados (${totalBloques} bloques disponibles)`
      };
    }

    const bloques = [];
    const duracionClaseMinutos = 45;
    const breakMinutos = 15;

    // Horario fijo: 9:00 AM - 8:00 PM
    const horaInicioMinutos = 9 * 60; // 9:00 AM
    const horaFinMinutos = 20 * 60; // 8:00 PM

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

          const disponibilidad = disponibilidadAlumnoRepository.create({
            alumnoId,
            diaSemana: dia,
            fecha: fechaStr,
            horaInicio: inicio,
            horaFin: fin,
            disponible: false, // Por defecto no seleccionado
          });

          bloques.push(disponibilidad);
          horaActual += duracionClaseMinutos + breakMinutos;
        }
      }
    }

    // Guardar todos los bloques
    await disponibilidadAlumnoRepository.save(bloques);

    return {
      success: true,
      bloques: bloques.length,
      totalSeleccionables: totalClases,
      message: `${bloques.length} bloques generados para 2 semanas (puede seleccionar máximo ${totalClases})`
    };
  } catch (error) {
    console.error("Error generando bloques de disponibilidad del alumno:", error);
    throw error;
  }
};

/**
 * Obtener disponibilidades de un alumno
 */
export const obtenerDisponibilidadesAlumnoService = async (alumnoId) => {
  try {
    const disponibilidades = await disponibilidadAlumnoRepository.find({
      where: { alumnoId },
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
    console.error("Error obteniendo disponibilidades del alumno:", error);
    throw error;
  }
};

/**
 * Actualizar disponibilidad de un bloque
 */
export const actualizarDisponibilidadAlumnoService = async (bloqueId, disponible, fecha = null) => {
  try {
    const updateData = { disponible, updatedAt: new Date() };
    if (fecha) {
      updateData.fecha = fecha;
    }

    const resultado = await disponibilidadAlumnoRepository.update(
      { id: bloqueId },
      updateData
    );

    return resultado.affected > 0;
  } catch (error) {
    console.error("Error actualizando disponibilidad del alumno:", error);
    throw error;
  }
};

/**
 * Actualizar múltiples disponibilidades de alumno
 */
export const actualizarMultiplesDisponibilidadesAlumnoService = async (ids, disponible) => {
  try {
    const resultado = await disponibilidadAlumnoRepository
      .createQueryBuilder()
      .update()
      .set({ disponible, updatedAt: new Date() })
      .whereInIds(ids)
      .execute();

    return resultado.affected > 0;
  } catch (error) {
    console.error("Error actualizando múltiples disponibilidades del alumno:", error);
    throw error;
  }
};

/**
 * Obtener disponibilidades por día específico
 */
export const obtenerDisponibilidadesAlumnoPorDiaService = async (alumnoId, dia) => {
  try {
    const disponibilidades = await disponibilidadAlumnoRepository.find({
      where: { alumnoId, diaSemana: dia },
      order: { horaInicio: "ASC" },
    });

    return disponibilidades;
  } catch (error) {
    console.error("Error obteniendo disponibilidades por día del alumno:", error);
    throw error;
  }
};

/**
 * Obtener disponibilidades disponibles de un alumno en un horario específico
 */
export const obtenerDisponibilidadesAlumnoDisponiblesService = async (alumnoId, dia, horaInicio, horaFin) => {
  try {
    const disponibilidades = await disponibilidadAlumnoRepository.find({
      where: {
        alumnoId,
        diaSemana: dia,
        disponible: true,
      },
      order: { horaInicio: "ASC" },
    });

    // Filtrar por rango de horas
    return disponibilidades.filter((d) => {
      const diaInicio = horaAMinutos(d.horaInicio);
      const diaFin = horaAMinutos(d.horaFin);
      const rangoInicio = horaAMinutos(horaInicio);
      const rangoFin = horaAMinutos(horaFin);

      return diaInicio >= rangoInicio && diaFin <= rangoFin;
    });
  } catch (error) {
    console.error("Error obteniendo disponibilidades disponibles del alumno:", error);
    throw error;
  }
};
