import { AppDataSource } from "../config/configDb.js";
import {
  registrarAsistenciaClase,
  obtenerAvancesAlumno,
  verificarPuedeReservarPracticas,
  obtenerClasesCompletadas,
} from "../services/avances-temas.service.js";
import { ClaseOnlineSchema } from "../entities/clase-online.entity.js";
import { ClaseOnlineAlumnoSchema } from "../entities/clase-online-alumno.entity.js";

export const generar_avances_alumno = async (req, res) => {
  try {
    const { id } = req.params;

    res.json({
      success: true,
      message: "Avances generados automáticamente al registrarse",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar avances",
      error: error.message,
    });
  }
};

export const obtener_instancias_del_dia = async (req, res) => {
  try {
    const { fecha, id_profesor } = req.query;

    if (!fecha || !id_profesor) {
      return res.status(400).json({
        success: false,
        message: "Fecha e id_profesor son requeridos",
      });
    }

    // Query SQL directo para obtener clases y sus inscritos en una sola consulta
    const clases = await AppDataSource.query(
      `SELECT
        co.id,
        co."numeroTema",
        co."nombreTema",
        co."horaInicio",
        co."horaFin",
        co."diaSemana",
        co.fecha,
        COUNT(coa.id) as cantidad_inscritos
      FROM clases_online co
      LEFT JOIN clase_online_alumno coa ON co.id = coa."claseOnlineId"
      WHERE co."profesorId" = $1
        AND co."tipoDisponibilidad" = 'teorica'
        AND DATE(co.fecha) = DATE($2)
      GROUP BY co.id, co."numeroTema", co."nombreTema", co."horaInicio", co."horaFin", co."diaSemana", co.fecha
      ORDER BY co."horaInicio"`,
      [parseInt(id_profesor), fecha]
    );

    // Convertir cantidad_inscritos a número
    const clasesConInscritos = clases.map(clase => ({
      id: clase.id,
      numeroTema: clase.numeroTema,
      nombreTema: clase.nombreTema,
      horaInicio: clase.horaInicio,
      horaFin: clase.horaFin,
      diaSemana: clase.diaSemana,
      cantidad_inscritos: parseInt(clase.cantidad_inscritos) || 0,
    }));

    res.json({
      success: true,
      clases: clasesConInscritos,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener instancias",
      error: error.message,
    });
  }
};

export const obtener_alumnos_inscritos = async (req, res) => {
  try {
    const { id } = req.params;
    const claseOnlineAlumnoRepository = AppDataSource.getRepository(
      ClaseOnlineAlumnoSchema
    );

    const inscritos = await claseOnlineAlumnoRepository.find({
      where: { claseOnlineId: parseInt(id) },
      relations: ["alumno"],
    });

    const alumnos = inscritos.map((inscrito) => ({
      alumnoId: inscrito.alumnoId,
      nombre: inscrito.alumno.nombre,
      email: inscrito.alumno.email,
      asistio: false,
    }));

    res.json({
      success: true,
      alumnos,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener alumnos inscritos",
      error: error.message,
    });
  }
};

export const registrar_asistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { alumnos_asistieron } = req.body;

    if (!Array.isArray(alumnos_asistieron) || alumnos_asistieron.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar al menos un alumno",
      });
    }

    await registrarAsistenciaClase(parseInt(id), alumnos_asistieron);

    res.json({
      success: true,
      message: "Asistencia registrada correctamente",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al registrar asistencia",
      error: error.message,
    });
  }
};

export const verificar_puede_reservar = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await verificarPuedeReservarPracticas(parseInt(id));

    res.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar permiso",
      error: error.message,
    });
  }
};

export const obtener_clases_completadas = async (req, res) => {
  try {
    const { id } = req.params;

    const clases = await obtenerClasesCompletadas(parseInt(id));

    res.json({
      success: true,
      clases,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener clases completadas",
      error: error.message,
    });
  }
};

export const crear_avances_masivos = async (req, res) => {
  try {
    const { alumnoIds } = req.body;

    if (!Array.isArray(alumnoIds) || alumnoIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar un array de alumnoIds",
      });
    }

    for (const alumnoId of alumnoIds) {
      for (let tema = 1; tema <= 10; tema++) {
        await AppDataSource.query(
          `INSERT INTO avances_temas (id_alumno, id_tema, completado, created_at)
           VALUES ($1, $2, false, NOW())
           ON CONFLICT DO NOTHING`,
          [alumnoId, tema]
        );
      }
    }

    res.json({
      success: true,
      message: `Avances creados para ${alumnoIds.length} alumno(s)`,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear avances masivos",
      error: error.message,
    });
  }
};

export const completar_primeros_temas = async (req, res) => {
  try {
    const { alumnoId, cantidad } = req.body;

    if (!alumnoId || !cantidad) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar alumnoId y cantidad",
      });
    }

    await AppDataSource.query(
      `UPDATE avances_temas
       SET completado = true, fecha_completado = NOW()
       WHERE id_alumno = $1 AND id_tema <= $2`,
      [alumnoId, cantidad]
    );

    res.json({
      success: true,
      message: `Primeros ${cantidad} temas completados para alumno ${alumnoId}`,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al completar temas",
      error: error.message,
    });
  }
};
