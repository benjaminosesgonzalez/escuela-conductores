import { AppDataSource } from "../config/configDb.js";

export const obtenerCriterios = async () => {
  try {
    const criterios = await AppDataSource.query(
      `SELECT id, nombre, tipo_falta, puntaje_descuento, orden
       FROM criterios_evaluacion_practica
       WHERE activo = true
       ORDER BY orden ASC`
    );
    return criterios;
  } catch (error) {
    console.error("Error obteniendo criterios:", error);
    throw error;
  }
};

export const obtenerClasesPracticasProfesor = async (profesorId) => {
  try {
    const clases = await AppDataSource.query(
      `SELECT
        cp.id,
        cp.fecha,
        cp."horaInicio",
        cp."horaFin",
        cp."sedeId",
        s.nombre as sede_nombre,
        cp."alumnoId" as alumno_id,
        a.nombre as alumno_nombre
       FROM clases_practicas cp
       LEFT JOIN sedes s ON cp."sedeId" = s.id
       LEFT JOIN alumnos a ON cp."alumnoId" = a.id
       WHERE cp."profesorId" = $1
       ORDER BY cp.fecha, cp."horaInicio"`,
      [profesorId]
    );
    return clases;
  } catch (error) {
    console.error("Error obteniendo clases prácticas del profesor:", error);
    throw error;
  }
};

export const crearEvaluacion = async (
  clasePracticaId,
  profesorId,
  alumnoId
) => {
  try {
    const clase = await AppDataSource.query(
      `SELECT fecha, "horaInicio" FROM clases_practicas WHERE id = $1`,
      [clasePracticaId]
    );

    if (clase.length === 0) {
      throw new Error("Clase práctica no encontrada");
    }

    const { fecha, horaInicio } = clase[0];

    const evaluacion = await AppDataSource.query(
      `INSERT INTO evaluaciones_practicas
       (clase_practica_id, profesor_id, alumno_id, fecha, hora, nota_inicial, estado)
       VALUES ($1, $2, $3, $4, $5, 7.0, 'en_proceso')
       RETURNING id`,
      [clasePracticaId, profesorId, alumnoId, fecha, horaInicio]
    );

    return {
      evaluacion_id: evaluacion[0].id,
      nota_inicial: 7.0,
      estado: "en_proceso",
    };
  } catch (error) {
    console.error("Error creando evaluación:", error);
    throw error;
  }
};

export const agregarCriterioAEvaluacion = async (
  evaluacionId,
  criterioId
) => {
  try {
    // Obtener criterio
    const criterio = await AppDataSource.query(
      `SELECT id, nombre, tipo_falta, puntaje_descuento
       FROM criterios_evaluacion_practica
       WHERE id = $1`,
      [criterioId]
    );

    if (criterio.length === 0) {
      throw new Error("Criterio no encontrado");
    }

    const { nombre, tipo_falta, puntaje_descuento } = criterio[0];

    // Obtener criterios actuales de la evaluación
    const criteriosActuales = await AppDataSource.query(
      `SELECT ec.criterio_evaluacion_id, cep.puntaje_descuento
       FROM evaluacion_criterios ec
       JOIN criterios_evaluacion_practica cep ON ec.criterio_evaluacion_id = cep.id
       WHERE ec.evaluacion_practica_id = $1
       ORDER BY ec.orden ASC`,
      [evaluacionId]
    );

    // Calcular nueva nota
    let sumDescuentos = 0;
    criteriosActuales.forEach((c) => {
      sumDescuentos += parseFloat(c.puntaje_descuento);
    });
    sumDescuentos += parseFloat(puntaje_descuento);

    const notaActual = 7.0 - sumDescuentos;

    // Agregar criterio
    const orden = criteriosActuales.length + 1;
    await AppDataSource.query(
      `INSERT INTO evaluacion_criterios (evaluacion_practica_id, criterio_evaluacion_id, orden)
       VALUES ($1, $2, $3)`,
      [evaluacionId, criterioId, orden]
    );

    // Verificar si es falta grave (alta)
    if (tipo_falta === "alta") {
      // Terminar evaluación automáticamente
      await AppDataSource.query(
        `UPDATE evaluaciones_practicas
         SET nota_final = $1, aprobado = $2, estado = 'completada', falta_grave_detectada = $3
         WHERE id = $4`,
        [
          Math.max(notaActual, 0),
          notaActual > 4.0,
          nombre,
          evaluacionId,
        ]
      );

      return {
        terminar: true,
        falta_grave: nombre,
        tipo_falta: tipo_falta,
        nota_final: Math.max(notaActual, 0),
        aprobado: notaActual > 4.0,
      };
    }

    return {
      terminar: false,
      nota_actual: Math.max(notaActual, 0),
      criterio_agregado: {
        id: criterioId,
        nombre: nombre,
        tipo_falta: tipo_falta,
        puntaje_descuento: puntaje_descuento,
      },
    };
  } catch (error) {
    console.error("Error agregando criterio:", error);
    throw error;
  }
};

export const obtenerCriteriosEvaluacion = async (evaluacionId) => {
  try {
    const criterios = await AppDataSource.query(
      `SELECT ec.criterio_evaluacion_id, cep.nombre, cep.tipo_falta, cep.puntaje_descuento, ec.orden
       FROM evaluacion_criterios ec
       JOIN criterios_evaluacion_practica cep ON ec.criterio_evaluacion_id = cep.id
       WHERE ec.evaluacion_practica_id = $1
       ORDER BY ec.orden ASC`,
      [evaluacionId]
    );
    return criterios;
  } catch (error) {
    console.error("Error obteniendo criterios de evaluación:", error);
    throw error;
  }
};

export const terminarEvaluacion = async (evaluacionId) => {
  try {
    const criterios = await obtenerCriteriosEvaluacion(evaluacionId);

    let sumDescuentos = 0;
    criterios.forEach((c) => {
      sumDescuentos += parseFloat(c.puntaje_descuento);
    });

    const notaFinal = Math.max(7.0 - sumDescuentos, 0);
    const aprobado = notaFinal > 4.0;

    await AppDataSource.query(
      `UPDATE evaluaciones_practicas
       SET nota_final = $1, aprobado = $2, estado = 'completada'
       WHERE id = $3`,
      [notaFinal, aprobado, evaluacionId]
    );

    return {
      nota_final: notaFinal,
      aprobado: aprobado,
      criterios_aplicados: criterios.length,
    };
  } catch (error) {
    console.error("Error terminando evaluación:", error);
    throw error;
  }
};

export const obtenerHistorialEvaluacionesProfesor = async (profesorId) => {
  try {
    const evaluaciones = await AppDataSource.query(
      `SELECT
        ep.id,
        ep.fecha,
        ep.hora,
        ep.nota_final,
        ep.aprobado,
        ep.estado,
        a.nombre as alumno_nombre,
        cp.id as clase_practica_id,
        COUNT(DISTINCT ec.id) as total_criterios
       FROM evaluaciones_practicas ep
       JOIN alumnos a ON ep.alumno_id = a.id
       JOIN clases_practicas cp ON ep.clase_practica_id = cp.id
       LEFT JOIN evaluacion_criterios ec ON ep.id = ec.evaluacion_practica_id
       WHERE ep.profesor_id = $1
       GROUP BY ep.id, a.nombre, cp.id
       ORDER BY ep.fecha DESC, ep.hora DESC`,
      [profesorId]
    );
    return evaluaciones;
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    throw error;
  }
};
