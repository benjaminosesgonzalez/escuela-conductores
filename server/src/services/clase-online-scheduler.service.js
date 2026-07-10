import cron from 'node-cron';
import { AppDataSource } from '../config/configDb.js';
import { obtenerTemaPorDia } from '../config/temas.js';
import { ClaseOnlineSchema } from '../entities/clase-online.entity.js';

const claseOnlineRepository = AppDataSource.getRepository(ClaseOnlineSchema);

/**
 * Determina qué ciclo de temas corresponde (1-5 o 6-10)
 * Basado en el número de semana desde el inicio
 */
const obtenerCicloTemas = (numeroSemanaGlobal) => {
  // Ciclo A: temas 1-5 (semanas 0, 2, 4, 6...)
  // Ciclo B: temas 6-10 (semanas 1, 3, 5, 7...)
  return numeroSemanaGlobal % 2 === 0 ? 'A' : 'B';
};

/**
 * Calcula el número de semana global desde una fecha de referencia
 */
const calcularSemanaGlobal = (fecha) => {
  const fechaReferencia = new Date(2026, 6, 7); // 7 de julio de 2026 (semana 0)
  const diferenciaDias = Math.floor((fecha - fechaReferencia) / (1000 * 60 * 60 * 24));
  const semanaGlobal = Math.floor(diferenciaDias / 7);
  return Math.max(0, semanaGlobal);
};

/**
 * Obtiene la fecha del lunes de la semana siguiente
 */
const obtenerLunesSiguiente = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay();

  // Calcular días hasta el próximo lunes
  let diasHastaLunes;
  if (diaSemana === 0) {
    diasHastaLunes = 1; // Domingo -> próximo lunes
  } else if (diaSemana === 1) {
    diasHastaLunes = 7; // Lunes -> próximo lunes (en una semana)
  } else {
    diasHastaLunes = 8 - diaSemana; // Otro día -> próximo lunes
  }

  const lunesSiguiente = new Date(hoy);
  lunesSiguiente.setDate(hoy.getDate() + diasHastaLunes);
  lunesSiguiente.setHours(0, 0, 0, 0);

  return lunesSiguiente;
};

/**
 * Genera clases para una semana específica
 */
export const generarClasesParaSemana = async (lunesBase) => {
  try {
    console.log(`\n🔄 Generando clases para semana comenzando ${lunesBase.toISOString().split('T')[0]}`);

    // Obtener todos los profesores
    const profesores = await AppDataSource.query(
      `SELECT DISTINCT p.id FROM profesores p
       JOIN disponibilidades d ON p.id = d."profesorId"
       WHERE d.disponible = true`
    );

    if (profesores.length === 0) {
      console.log('⚠️ No hay profesores con disponibilidades configuradas');
      return { success: false, message: 'No hay profesores disponibles' };
    }

    const semanaGlobal = calcularSemanaGlobal(lunesBase);
    const ciclo = obtenerCicloTemas(semanaGlobal);
    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

    console.log(`📅 Semana Global: ${semanaGlobal} | Ciclo: ${ciclo} (Temas ${ciclo === 'A' ? '1-5' : '6-10'})`);

    let clasesGeneradas = 0;

    // Para cada profesor
    for (const profesor of profesores) {
      const profesorId = profesor.id;

      // Obtener disponibilidades del profesor
      const disponibilidades = await AppDataSource.query(
        `SELECT * FROM disponibilidades_profesores
         WHERE "profesorId" = $1 AND disponible = true
         ORDER BY "diaSemana" ASC, "horaInicio" ASC`,
        [profesorId]
      );

      // Generar una clase por disponibilidad en cada día
      for (const disp of disponibilidades) {
        const indice = diasSemana.indexOf(disp.diaSemana.toLowerCase());
        if (indice === -1) continue;

        // Calcular fecha para este día
        const fechaClase = new Date(lunesBase);
        fechaClase.setDate(lunesBase.getDate() + indice);
        const fechaStr = fechaClase.toISOString().split('T')[0];

        // Obtener tema basado en el ciclo actual y semana global
        // En ciclo A, numeroSemana es par (0, 2, 4...)
        // En ciclo B, numeroSemana es impar (1, 3, 5...)
        const numeroSemanaLocal = semanaGlobal % 2;
        const tema = obtenerTemaPorDia(numeroSemanaLocal, disp.diaSemana);

        if (!tema) {
          console.log(`⚠️ No se encontró tema para ${disp.diaSemana}`);
          continue;
        }

        // Verificar si la clase ya existe
        const existente = await AppDataSource.query(
          `SELECT id FROM clases_online
           WHERE "profesorId" = $1 AND fecha = $2 AND "horaInicio" = $3`,
          [profesorId, fechaStr, disp.horaInicio.substring(0, 5)]
        );

        if (existente.length > 0) {
          console.log(`ℹ️ Clase ya existe: Prof ${profesorId}, ${disp.diaSemana} ${fechaStr}`);
          continue;
        }

        // Crear la clase
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
          estado: 'activa'
        });

        await claseOnlineRepository.save(claseOnline);
        clasesGeneradas++;
        console.log(`✅ Clase creada: ${tema.numero} - ${tema.nombre} (${disp.diaSemana} ${fechaStr} ${horaInicio})`);
      }
    }

    console.log(`\n✨ Total de clases generadas: ${clasesGeneradas}\n`);
    return { success: true, clasesGeneradas };
  } catch (error) {
    console.error('❌ Error generando clases:', error);
    throw error;
  }
};

/**
 * Inicializa el scheduler para generar clases cada viernes
 */
export const inicializarScheduler = () => {
  try {
    // Ejecutar a las 23:59 todos los viernes (día 5)
    // Formato: minuto hora * * viernes
    const job = cron.schedule('59 23 * * 5', async () => {
      console.log('\n🚀 Ejecutando generación automática de clases...');
      try {
        await generarClasesParaSemana(obtenerLunesSiguiente());
      } catch (error) {
        console.error('❌ Error en job scheduler:', error);
      }
    });

    console.log('✅ Scheduler de clases inicializado');
    console.log('⏰ Se ejecutará cada viernes a las 23:59');

    return job;
  } catch (error) {
    console.error('❌ Error inicializando scheduler:', error);
    throw error;
  }
};

export default {
  generarClasesParaSemana,
  inicializarScheduler
};
