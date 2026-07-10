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
    const claseRepository = AppDataSource.getRepository(ClaseOnlineSchema);
    const claseOnlineAlumnoRepository = AppDataSource.getRepository(
      ClaseOnlineAlumnoSchema
    );

    const clases = await claseRepository.find({
      where: {
        profesorId: parseInt(id_profesor),
        tipoDisponibilidad: "teorica",
      },
    });

    const clasesDelDia = clases
      .filter(clase => {
        // Normalizar la fecha de la clase a formato YYYY-MM-DD
        let fechaClase;
        if (typeof clase.fecha === 'string') {
          fechaClase = clase.fecha.split('T')[0]; // Si es ISO 8601, tomar solo la fecha
        } else if (clase.fecha instanceof Date) {
          fechaClase = clase.fecha.toISOString().split('T')[0];
        } else {
          fechaClase = clase.fecha;
        }
        return fechaClase === fecha;
      })
      .map(clase => ({
        id: clase.id,
        numeroTema: clase.numeroTema,
        nombreTema: clase.nombreTema,
        horaInicio: clase.horaInicio,
        horaFin: clase.horaFin,
        diaSemana: clase.diaSemana,
      }));

    // Agregar cantidad de inscritos a cada clase
    const clasesConInscritos = await Promise.all(
      clasesDelDia.map(async (clase) => {
        const inscritos = await claseOnlineAlumnoRepository.count({
          where: { claseOnlineId: clase.id },
        });
        return { ...clase, cantidad_inscritos: inscritos };
      })
    );

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
