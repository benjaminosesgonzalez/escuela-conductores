import { AppDataSource } from "../config/configDb.js";
import { ClaseOnlineSchema } from "../entities/clase-online.entity.js";
import { obtenerTemaPorDia } from "../config/temas.js";

const claseOnlineRepository = AppDataSource.getRepository(ClaseOnlineSchema);

export const generarClasesOnlineService = async (profesorId) => {
  try {
    console.log(`🎓 Generando clases online para profesor: ${profesorId}`);

    // Obtener disponibilidades del profesor
    const disponibilidades = await AppDataSource.query(
      `SELECT * FROM disponibilidades WHERE "profesorId" = $1 ORDER BY fecha ASC, "diaSemana" ASC, "horaInicio" ASC`,
      [profesorId]
    );

    console.log(`📅 Disponibilidades encontradas: ${disponibilidades.length}`);

    if (disponibilidades.length === 0) {
      return {
        success: false,
        message: "El profesor no tiene disponibilidades configuradas"
      };
    }

    // Eliminar clases online previas para este profesor para regenerarlas
    await claseOnlineRepository.delete({ profesorId });
    console.log(`🗑️ Clases online anteriores eliminadas`);

    const clasesOnline = [];

    // Generar una clase online por cada disponibilidad
    for (const disp of disponibilidades) {
      try {
        // Calcular número de semana basado en la fecha
        const hoy = new Date();
        const diaSemana = hoy.getDay();
        const diasAlLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
        const lunesActual = new Date(hoy);
        lunesActual.setDate(hoy.getDate() + diasAlLunes);

        // Convertir fecha string a Date para comparación
        const [year, month, day] = disp.fecha.split('-');
        const fechaDisp = new Date(year, month - 1, day);

        const semana0Inicio = new Date(lunesActual);
        const semana1Inicio = new Date(lunesActual);
        semana1Inicio.setDate(semana0Inicio.getDate() + 7);

        let numeroSemana = 0;
        if (fechaDisp >= semana1Inicio) {
          numeroSemana = 1;
        }

        // Obtener tema correspondiente al día
        const tema = obtenerTemaPorDia(numeroSemana, disp.diaSemana);

        if (!tema) {
          console.log(`⚠️ No se encontró tema para semana ${numeroSemana}, día ${disp.diaSemana}`);
          continue;
        }

        const claseOnline = claseOnlineRepository.create({
          profesorId,
          numeroTema: tema.numero,
          nombreTema: tema.nombre,
          diaSemana: disp.diaSemana,
          fecha: disp.fecha,
          horaInicio: disp.horaInicio,
          horaFin: disp.horaFin,
          capacidadMaxima: 30,
          alumnosAgendados: 0,
          linkZoom: null,
          estado: "activa",
        });

        clasesOnline.push(claseOnline);
        console.log(`✅ Clase creada: ${tema.nombre} - ${disp.diaSemana} ${disp.fecha} ${disp.horaInicio}-${disp.horaFin}`);
      } catch (itemError) {
        console.error(`❌ Error procesando disponibilidad:`, itemError);
      }
    }

    // Guardar todas las clases online
    if (clasesOnline.length > 0) {
      try {
        await claseOnlineRepository.save(clasesOnline);
        console.log(`💾 ${clasesOnline.length} clases online guardadas en la BD`);
      } catch (saveError) {
        console.error(`❌ Error al guardar clases online:`, saveError);
        throw saveError;
      }
    }

    return {
      success: true,
      clases: clasesOnline.length,
      message: `${clasesOnline.length} clases online generadas`
    };
  } catch (error) {
    console.error("Error generando clases online:", error);
    throw error;
  }
};

export const obtenerClasesOnlineProfesor = async (profesorId) => {
  try {
    const clases = await claseOnlineRepository.find({
      where: { profesorId },
      order: {
        fecha: "ASC",
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

    clases.forEach((clase) => {
      if (agrupado[clase.diaSemana]) {
        agrupado[clase.diaSemana].push(clase);
      }
    });

    return agrupado;
  } catch (error) {
    console.error("Error obteniendo clases online:", error);
    throw error;
  }
};

export const actualizarLinkZoom = async (claseOnlineId, linkZoom) => {
  try {
    const resultado = await claseOnlineRepository.update(
      { id: claseOnlineId },
      { linkZoom, updatedAt: new Date() }
    );

    return resultado.affected > 0;
  } catch (error) {
    console.error("Error actualizando link Zoom:", error);
    throw error;
  }
};

export const obtenerClasesOnlineDisponibles = async (profesorId, diaSemana) => {
  try {
    const clases = await claseOnlineRepository.find({
      where: {
        profesorId,
        diaSemana,
        estado: "activa",
      },
      order: {
        horaInicio: "ASC",
      },
    });

    return clases;
  } catch (error) {
    console.error("Error obteniendo clases online disponibles:", error);
    throw error;
  }
};
