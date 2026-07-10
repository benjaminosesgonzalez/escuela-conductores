"use strict";
import {
  seleccionarPlanInteresService,
  matricularAlumnoService,
  matricularNuevoAlumnoService,
  editarAlumnoService,
  autoRegistroAlumnoService,
  asignarSedeMasivaPorIdsService,
  getAlumnosService,
  resetPasswordAlumnoService,
  eliminarAlumnosPorIdsService,
} from "../services/alumno.service.js";

// Matricular nuevo alumno (por secretaria)
export async function matricularNuevoAlumno(req, res) {
  try {
    const {
      email,
      nombre,
      rut,
      telefono,
      sexo,
      comuna,
      sede,
      id_plan_matriculado,
    } = req.body;

    // 1. Quitamos 'password' de la validación estricta
    if (!email || !nombre || !rut) {
      return res.status(400).json({
        success: false,
        message: "Email, nombre y RUT son obligatorios.",
      });
    }

    // 2. Generar contraseña temporal: Últimos 5 dígitos del RUT
    // Limpiamos el RUT de puntos y guiones para evitar inconsistencias
    const rutLimpio = rut.replace(/[^0-9kK]/g, "");
    const defaultPassword = rutLimpio.slice(-5);

    // 3. Enviamos el payload completo al servicio, incluyendo la contraseña generada
    const alumno = await matricularNuevoAlumnoService({
      email,
      password: defaultPassword,
      nombre,
      rut,
      telefono,
      sexo,
      comuna,
      sede,
      id_plan_matriculado,
    });

    res.status(201).json({
      success: true,
      message: `Alumno matriculado correctamente. La clave temporal es: ${defaultPassword}`,
      data: alumno,
    });
  } catch (error) {
    console.error("Error al registrar alumno:", error);

    // Captura específica de errores de duplicidad de PostgreSQL (Unique Constraint)
    if (error.code === "23505") {
      const campoDuplicado = error.detail.includes("email")
        ? "correo electrónico"
        : "RUT";
      return res.status(400).json({
        success: false,
        message: `El ${campoDuplicado} ingresado ya se encuentra registrado en el sistema.`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error interno al registrar alumno.",
      error: error.message,
    });
  }
}

// Obtener todos los alumnos
export async function getAlumnos(req, res) {
  try {
    const alumnos = await getAlumnosService();
    res.status(200).json({ success: true, data: alumnos });
  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener alumnos.",
      error: error.message,
    });
  }
}

// Editar datos de alumno
export async function editarAlumno(req, res) {
  try {
    const { id } = req.params;
    const datosAEditar = req.body;

    const alumnoActualizado = await editarAlumnoService(
      parseInt(id),
      datosAEditar,
    );

    if (!alumnoActualizado) {
      return res.status(404).json({
        success: false,
        message: "Alumno no encontrado.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alumno actualizado correctamente.",
      data: alumnoActualizado,
    });
  } catch (error) {
    console.error("Error al editar alumno:", error);
    res.status(500).json({
      success: false,
      message: "Error al editar alumno.",
      error: error.message,
    });
  }
}

export async function elegirPlanPreferencia(req, res) {
  try {
    const idUsuario = req.user.sub;

    const { id_plan } = req.body;

    const alumno = await seleccionarPlanInteresService(idUsuario, id_plan);

    if (!alumno) {
      return res

        .status(404)

        .json({ message: "No se encontró el perfil de alumno." });
    }

    res

      .status(200)

      .json({
        message: "Preferencia de plan guardada correctamente.",

        data: alumno,
      });
  } catch (error) {
    res

      .status(500)

      .json({
        message: "Error al seleccionar preferencia.",

        error: error.message,
      });
  }
}

export async function oficializarMatricula(req, res) {
  try {
    const {
      id_alumno,
      idAlumno,
      alumnoId,
      idUsuario,
      id_plan_definitivo,
      id_plan,
      idPlan,
    } = req.body;

    // 1. Rescatamos el ID de donde sea que venga (body o token)
    const alumnoIdCrudo =
      id_alumno ||
      idAlumno ||
      alumnoId ||
      idUsuario ||
      req.user?.sub ||
      req.user?.id;
    const planIdCrudo = id_plan_definitivo || id_plan || idPlan;

    // 2. 🔥 IMPRIMIR AUDITORÍA EN TU TERMINAL (Revisa los logs de tu consola Node.js)
    console.log("=================================================");
    console.log("🕵️‍♂️ AUDITORÍA DE MATRÍCULA ENTRANTE:");
    console.log(
      "-> Alumno ID recibido (Crudo):",
      alumnoIdCrudo,
      "Tipo:",
      typeof alumnoIdCrudo,
    );
    console.log(
      "-> Plan ID recibido (Crudo):",
      planIdCrudo,
      "Tipo:",
      typeof planIdCrudo,
    );
    console.log("-> Datos en req.user (Token):", req.user);
    console.log("=================================================");

    if (!alumnoIdCrudo || !planIdCrudo) {
      return res.status(400).json({
        success: false,
        message:
          "El ID del alumno y el ID del plan definitivo son obligatorios.",
      });
    }

    // 3. 🔄 FORZAMOS NUMBER() EN AMBOS: Rompe el bloqueo de tipos de datos en PostgreSQL
    const matriculado = await matricularAlumnoService(
      Number(alumnoIdCrudo),
      Number(planIdCrudo),
    );

    if (!matriculado) {
      return res.status(404).json({
        success: false,
        message: `Alumno no encontrado en los registros. Intentaste buscar el ID numérico: ${Number(alumnoIdCrudo)}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Alumno matriculado exitosamente.",
      data: matriculado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al procesar la matrícula.",
      error: error.message,
    });
  }
}

// Auto-registro de alumno (registro público)

export async function autoRegistroAlumno(req, res) {
  try {
    const {
      email,
      password,
      nombre,
      rut,
      telefono,
      sexo,
      comuna,
      id_plan_interes,
    } = req.body;

    if (!email || !password || !nombre || !rut) {
      return res.status(400).json({
        success: false,

        message: "Email, contraseña, nombre y RUT son obligatorios.",
      });
    }

    const alumno = await autoRegistroAlumnoService({
      email,

      password,

      nombre,

      rut,

      telefono,

      sexo,

      comuna,

      id_plan_interes,
    });

    res.status(201).json({
      success: true,

      message: "Alumno registrado correctamente.",

      data: alumno,
    });
  } catch (error) {
    console.error("Error en auto-registro:", error);

    res.status(500).json({
      success: false,

      message: "Error en el auto-registro.",

      error: error.message,
    });
  }
}

// Asignar sede masiva
export async function asignarSedeMasiva(req, res) {
  try {
    // 1. Extraemos de forma inteligente (aceptamos snake_case del front o camelCase del back)
    const alumnosIds = req.body.alumnosIds || req.body.alumnos_ids;
    const idSede = req.body.idSede || req.body.sede;

    // 2. Validación estricta
    if (!alumnosIds || !Array.isArray(alumnosIds) || !idSede) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos: alumnosIds (array) e idSede son obligatorios.",
      });
    }

    // 3. Pasamos los datos validados a tu servicio
    const cantidadActualizada = await asignarSedeMasivaPorIdsService(
      alumnosIds,
      idSede,
    );

    res.status(200).json({
      success: true,
      message: `Sede asignada correctamente a ${cantidadActualizada} alumno(s).`,
      data: { cantidadActualizada },
    });
  } catch (error) {
    console.error("Error al asignar sede masiva:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al asignar sede.",
      error: error.message,
    });
  }
}

//resetear constraseña
export async function resetPasswordAlumno(req, res) {
  try {
    const { id } = req.params;

    // Delegamos toda la carga pesada a la capa de servicio
    const nuevaPassword = await resetPasswordAlumnoService(id);

    // Si el servicio devuelve null, el alumno no existía
    if (!nuevaPassword) {
      return res
        .status(404)
        .json({ success: false, message: "Alumno no encontrado." });
    }

    return res.status(200).json({
      success: true,
      message: `Contraseña reiniciada exitosamente a: ${nuevaPassword}`,
    });
  } catch (error) {
    console.error("Error al reiniciar contraseña:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error interno del servidor" });
  }
}

export async function eliminarAlumnosMasivo(req, res) {
  try {
    const alumnosIds = req.body.alumnosIds || req.body.alumnos_ids;

    if (!alumnosIds || !Array.isArray(alumnosIds) || alumnosIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar un array de IDs de alumnos.",
      });
    }

    const cantidadEliminada = await eliminarAlumnosPorIdsService(alumnosIds);

    res.status(200).json({
      success: true,
      message: `Se han eliminado ${cantidadEliminada} alumno(s) correctamente.`,
    });
  } catch (error) {
    console.error("Error al eliminar alumnos:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al eliminar alumnos." });
  }
}

// Obtener plan del alumno
export async function obtenerPlanAlumno(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID de alumno es requerido." });
    }

    // Importar AppDataSource
    const { AppDataSource } = await import("../config/configDb.js");

    const alumno = await AppDataSource.query(
      `SELECT a.id, a.id_plan_matriculado, p.name as plan_nombre
       FROM alumnos a
       LEFT JOIN plans p ON a.id_plan_matriculado = p.id
       WHERE a.id = $1`,
      [parseInt(id)]
    );

    if (!alumno || alumno.length === 0) {
      return res.status(404).json({ success: false, message: "Alumno no encontrado." });
    }

    const data = alumno[0];
    res.status(200).json({
      success: true,
      plan_id: data.id_plan_matriculado,
      plan_nombre: data.plan_nombre,
      alumno_id: data.id
    });
  } catch (error) {
    console.error("Error al obtener plan:", error);
    res.status(500).json({ success: false, message: "Error al obtener plan del alumno.", error: error.message });
  }
}

// Obtener clases próximas del alumno
export async function obtenerClasesProximas(req, res) {
  try {
    const { alumnoId } = req.params;

    if (!alumnoId) {
      return res.status(400).json({ success: false, message: "ID de alumno requerido" });
    }

    const { AppDataSource } = await import("../config/configDb.js");

    // Obtener clases online próximas
    const clasesOnline = await AppDataSource.query(`
      SELECT
        co.id,
        co."horaInicio",
        co."horaFin",
        co.fecha,
        p.nombre as profesor,
        'Teórica' as tipo,
        co."nombreTema" as tema,
        'Zoom' as ubicacion,
        'teórica' as tipo_label
      FROM clases_online co
      JOIN clase_online_alumno coa ON co.id = coa."claseOnlineId"
      LEFT JOIN profesores p ON co."profesorId" = p.id
      WHERE coa."alumnoId" = $1 AND co.fecha >= CURRENT_DATE
      ORDER BY co.fecha, co."horaInicio"
    `, [alumnoId]);

    // Obtener clases prácticas próximas
    const clasesPracticas = await AppDataSource.query(`
      SELECT
        cp.id,
        cp."horaInicio",
        cp."horaFin",
        cp.fecha,
        p.nombre as profesor,
        'Práctica' as tipo,
        '' as tema,
        s.nombre as ubicacion,
        'práctica' as tipo_label
      FROM clases_practicas cp
      LEFT JOIN profesores p ON cp."profesorId" = p.id
      LEFT JOIN sedes s ON cp."sedeId" = s.id
      WHERE cp."alumnoId" = $1 AND cp.fecha >= CURRENT_DATE
      ORDER BY cp.fecha, cp."horaInicio"
    `, [alumnoId]);

    // Combinar y formatear
    const todasLasClases = [...clasesOnline, ...clasesPracticas].map(clase => {
      const fecha = new Date(clase.fecha);
      const diasES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const mesesES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

      const diaES = diasES[fecha.getDay()];
      const numDia = fecha.getDate();
      const mesES = mesesES[fecha.getMonth()];
      const año = fecha.getFullYear();

      const fechaFormato = `${diaES.charAt(0).toUpperCase() + diaES.slice(1)} ${numDia} ${mesES} ${año}`;

      return {
        id: clase.id,
        fecha: `${fechaFormato} - ${clase.horaInicio} a ${clase.horaFin}`,
        profesor: clase.profesor,
        tipo: clase.tipo,
        tema: clase.tema,
        ubicacion: clase.ubicacion,
        tipo_label: clase.tipo_label
      };
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    res.json({ success: true, clases: todasLasClases });
  } catch (error) {
    console.error("Error al obtener clases próximas:", error);
    res.status(500).json({ success: false, message: "Error al obtener clases próximas" });
  }
}

// Obtener avance de temas teóricos
export async function obtenerAvanceTemas(req, res) {
  try {
    const { alumnoId } = req.params;

    if (!alumnoId) {
      return res.status(400).json({ success: false, message: "ID de alumno requerido" });
    }

    const { AppDataSource } = await import("../config/configDb.js");

    const temas = await AppDataSource.query(`
      SELECT
        id_tema as id,
        completado
      FROM avances_temas
      WHERE id_alumno = $1
      ORDER BY id_tema ASC
    `, [alumnoId]);

    const nombresTemas = [
      "Defensa vial",
      "Mecánica básica",
      "Señalética vial",
      "Conducción segura",
      "Leyes de tránsito",
      "Manejo del estrés",
      "Técnicas de frenado",
      "Visibilidad y luces",
      "Conducción nocturna",
      "Emergencias viales"
    ];

    const temasFormateados = nombresTemas.map((nombre, index) => {
      const temaBD = temas.find(t => t.id === index + 1);
      return {
        id: index + 1,
        nombre: nombre,
        completado: temaBD?.completado || false
      };
    });

    res.json({ success: true, temas: temasFormateados });
  } catch (error) {
    console.error("Error al obtener avance de temas:", error);
    res.status(500).json({ success: false, message: "Error al obtener avance de temas" });
  }
}

// Obtener avance de clases prácticas
export async function obtenerAvanceClasesPracticas(req, res) {
  try {
    const { alumnoId } = req.params;

    if (!alumnoId) {
      return res.status(400).json({ success: false, message: "ID de alumno requerido" });
    }

    const { AppDataSource } = await import("../config/configDb.js");

    // Obtener el plan del alumno
    const alumno = await AppDataSource.query(`
      SELECT a.id_plan_matriculado, p.total_classes
      FROM alumnos a
      LEFT JOIN plans p ON a.id_plan_matriculado = p.id
      WHERE a.id = $1
    `, [alumnoId]);

    if (!alumno || alumno.length === 0) {
      return res.status(404).json({ success: false, message: "Alumno no encontrado" });
    }

    const cantidadMaxima = alumno[0].total_classes || 0;

    // Obtener clases prácticas asignadas al alumno con sus evaluaciones
    const evaluaciones = await AppDataSource.query(`
      SELECT
        cp.id,
        cp.fecha,
        cp."horaInicio",
        cp."horaFin",
        COALESCE(ep.nota_final, ep.nota_inicial) as nota,
        ep.id as evaluacionId
      FROM clases_practicas cp
      LEFT JOIN evaluaciones_practicas ep ON cp.id = ep.clase_practica_id AND ep.alumno_id = $1
      WHERE cp."alumnoId" = $1
      ORDER BY cp.fecha ASC
    `, [alumnoId]);

    const completadas = evaluaciones.filter(e => e.evaluacionId !== null).length;

    res.json({
      success: true,
      completadas,
      cantidadMaxima,
      evaluaciones
    });
  } catch (error) {
    console.error("Error al obtener avance de clases prácticas:", error);
    res.status(500).json({ success: false, message: "Error al obtener avance de clases prácticas" });
  }
}

// Obtener estadísticas del alumno
export async function obtenerEstadisticasAlumno(req, res) {
  try {
    const { alumnoId } = req.params;

    if (!alumnoId) {
      return res.status(400).json({ success: false, message: "ID de alumno requerido" });
    }

    const { AppDataSource } = await import("../config/configDb.js");

    // Contar clases inscritas (online + prácticas)
    const clasesInscritasResult = await AppDataSource.query(`
      SELECT COUNT(*) as total FROM (
        SELECT id FROM clase_online_alumno WHERE "alumnoId" = $1
        UNION ALL
        SELECT id FROM clases_practicas WHERE "alumnoId" = $1
      ) as todas
    `, [alumnoId]);
    const clasesInscritas = parseInt(clasesInscritasResult[0]?.total || 0);

    // Obtener próxima clase
    const proximaClaseResult = await AppDataSource.query(`
      SELECT MIN(fecha) as proxima_fecha FROM (
        SELECT fecha FROM clases_online co
        JOIN clase_online_alumno coa ON co.id = coa."claseOnlineId"
        WHERE coa."alumnoId" = $1 AND co.fecha >= CURRENT_DATE
        UNION ALL
        SELECT fecha FROM clases_practicas WHERE "alumnoId" = $1 AND fecha >= CURRENT_DATE
      ) as todas
    `, [alumnoId]);

    let proximaClase = "—";
    if (proximaClaseResult[0]?.proxima_fecha) {
      const fecha = new Date(proximaClaseResult[0].proxima_fecha);
      proximaClase = fecha.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    }

    // Contar clases prácticas completadas
    const clasesCompletadasResult = await AppDataSource.query(`
      SELECT COUNT(*) as total FROM clases_practicas
      WHERE "alumnoId" = $1 AND fecha < CURRENT_DATE
    `, [alumnoId]);
    const clasesCompletadas = parseInt(clasesCompletadasResult[0]?.total || 0);

    res.json({
      success: true,
      clasesInscritas,
      proximaClase,
      clasesCompletadas
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ success: false, message: "Error al obtener estadísticas" });
  }
}
