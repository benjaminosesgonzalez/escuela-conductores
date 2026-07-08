import { AppDataSource } from "../config/configDb.js";
import { ClaseOnlineSchema } from "../entities/clase-online.entity.js";
import { obtenerTemaPorDia } from "../config/temas.js";

const claseOnlineRepository = AppDataSource.getRepository(ClaseOnlineSchema);

export const generarClasesOnlineService = async (profesorId) => {
  try {
    console.log(`🎓 Generando clases online para profesor: ${profesorId}`);

    // Obtener disponibilidades donde disponible = true SOLO PARA LAS PRIMERAS 2 SEMANAS
    // (aunque el profesor puede configurar hasta 4 semanas)
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diasAlLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunesActual = new Date(hoy);
    lunesActual.setDate(hoy.getDate() + diasAlLunes);

    const lunesProximo = new Date(lunesActual);
    lunesProximo.setDate(lunesActual.getDate() + 14); // 2 semanas = 14 días

    const lunesStr = String(lunesActual.getFullYear()).concat('-', String(lunesActual.getMonth() + 1).padStart(2, '0'), '-', String(lunesActual.getDate()).padStart(2, '0'));
    const lunesProxStr = String(lunesProximo.getFullYear()).concat('-', String(lunesProximo.getMonth() + 1).padStart(2, '0'), '-', String(lunesProximo.getDate()).padStart(2, '0'));

    const disponibilidades = await AppDataSource.query(
      `SELECT * FROM disponibilidades_profesores
       WHERE "profesorId" = $1 AND disponible = true AND fecha >= $2 AND fecha < $3
       ORDER BY fecha ASC, "diaSemana" ASC, "horaInicio" ASC`,
      [profesorId, lunesStr, lunesProxStr]
    );

    console.log(`📅 Disponibilidades disponibles encontradas: ${disponibilidades.length}`);

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

        // Crear lunesActual sin hora para comparaciones correctas
        const lunesActual = new Date(hoy);
        lunesActual.setDate(hoy.getDate() + diasAlLunes);
        lunesActual.setHours(0, 0, 0, 0);

        // Convertir fecha a string YYYY-MM-DD en zona horaria local
        let fechaStr = disp.fecha;
        let fechaDisp;

        if (typeof fechaStr === 'string') {
          // Ya es string, usarlo directamente
          if (fechaStr.includes('T')) {
            // ISO format - extraer la parte YYYY-MM-DD antes de la T
            fechaStr = fechaStr.split('T')[0];
          }
          // Parsear como YYYY-MM-DD (tanto si fue convertido de ISO como si ya lo era)
          const [year, month, day] = fechaStr.split('-');
          fechaDisp = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Es un objeto Date, convertir a string local (sin UTC)
          const tempDate = new Date(fechaStr);
          const year = tempDate.getFullYear();
          const month = String(tempDate.getMonth() + 1).padStart(2, '0');
          const day = String(tempDate.getDate()).padStart(2, '0');
          fechaStr = `${year}-${month}-${day}`;
          const [y, m, d] = fechaStr.split('-');
          fechaDisp = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        }

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

        console.log(`📅 Clase: ${disp.diaSemana} ${fechaStr} | Semana: ${numeroSemana} | Tema: ${tema.numero} - ${tema.nombre} | Comparación: fechaDisp=${fechaStr}, semana1Inicio=${semana1Inicio.toISOString().split('T')[0]}`);

        // Extraer HH:MM de los horarios (remover :SS si existen)
        const horaInicio = String(disp.horaInicio).substring(0, 5);
        const horaFin = String(disp.horaFin).substring(0, 5);

        const claseOnline = claseOnlineRepository.create({
          profesorId,
          numeroTema: tema.numero,
          nombreTema: tema.nombre,
          diaSemana: disp.diaSemana,
          fecha: fechaStr,
          horaInicio,
          horaFin,
          capacidadMaxima: 30,
          alumnosAgendados: 0,
          linkZoom: null,
          estado: "activa",
          tipoDisponibilidad: disp.tipoDisponibilidad || "teorica",
        });

        clasesOnline.push(claseOnline);
        console.log(`✅ Clase creada: ${tema.nombre} - ${disp.diaSemana} ${fechaStr} ${horaInicio}-${horaFin}`);
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

    // Agrupar por día de la semana y normalizar fechas a YYYY-MM-DD (local, no UTC)
    const agrupado = {
      lunes: [],
      martes: [],
      miércoles: [],
      jueves: [],
      viernes: [],
    };

    clases.forEach((clase) => {
      if (agrupado[clase.diaSemana]) {
        // Convertir fecha a string YYYY-MM-DD (local, no UTC)
        let fechaStr = clase.fecha;
        if (clase.fecha && typeof clase.fecha !== 'string') {
          // Si es objeto Date, convertir a string local
          const fecha = new Date(clase.fecha);
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          fechaStr = `${year}-${month}-${day}`;
        } else if (typeof clase.fecha === 'string' && clase.fecha.includes('T')) {
          // Si es ISO string, extraer la parte YYYY-MM-DD
          fechaStr = clase.fecha.split('T')[0];
        }

        agrupado[clase.diaSemana].push({
          ...clase,
          fecha: fechaStr
        });
      }
    });

    return agrupado;
  } catch (error) {
    console.error("Error obteniendo clases online:", error);
    throw error;
  }
};

// Nuevo servicio: obtener clases futuras con alumnos inscritos
export const obtenerMisClasesFuturas = async (profesorId) => {
  try {
    const clases = await AppDataSource.query(
      `SELECT DISTINCT
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
        co."createdAt",
        co."updatedAt",
        COUNT(coa.id) as "alumnosInscritos"
      FROM clases_online co
      LEFT JOIN clase_online_alumno coa ON co.id = coa."claseOnlineId"
      WHERE co."profesorId" = $1
        AND co.estado = 'activa'
      GROUP BY co.id
      HAVING COUNT(coa.id) > 0
      ORDER BY co.fecha ASC, co."horaInicio" ASC`,
      [profesorId]
    );

    // Agrupar por día de la semana y normalizar fechas a YYYY-MM-DD (local, no UTC)
    const agrupado = {
      lunes: [],
      martes: [],
      miércoles: [],
      jueves: [],
      viernes: [],
    };

    clases.forEach((clase) => {
      if (agrupado[clase.diaSemana]) {
        // Convertir fecha a string YYYY-MM-DD (local, no UTC)
        let fechaStr = clase.fecha;
        if (clase.fecha && typeof clase.fecha !== 'string') {
          // Si es objeto Date, convertir a string local
          const fecha = new Date(clase.fecha);
          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          fechaStr = `${year}-${month}-${day}`;
        } else if (typeof clase.fecha === 'string' && clase.fecha.includes('T')) {
          // Si es ISO string, extraer la parte YYYY-MM-DD
          fechaStr = clase.fecha.split('T')[0];
        }

        agrupado[clase.diaSemana].push({
          ...clase,
          fecha: fechaStr
        });
      }
    });

    return agrupado;
  } catch (error) {
    console.error("Error obteniendo clases futuras:", error);
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
