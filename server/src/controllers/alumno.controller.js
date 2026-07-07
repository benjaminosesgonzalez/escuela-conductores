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
  eliminarAlumnosPorIdsService
} from "../services/alumno.service.js";

// Matricular nuevo alumno (por secretaria)
export async function matricularNuevoAlumno(req, res) {
  try {
    const { email, nombre, rut, telefono, sexo, comuna, sede, id_plan_matriculado } = req.body;

    // 1. Quitamos 'password' de la validación estricta
    if (!email || !nombre || !rut) {
      return res.status(400).json({
        success: false,
        message: "Email, nombre y RUT son obligatorios."
      });
    }

    // 2. Generar contraseña temporal: Últimos 5 dígitos del RUT
    // Limpiamos el RUT de puntos y guiones para evitar inconsistencias
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
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
      id_plan_matriculado
    });

    res.status(201).json({
      success: true,
      message: `Alumno matriculado correctamente. La clave temporal es: ${defaultPassword}`,
      data: alumno
    });
  } catch (error) {
    console.error("Error al matricular alumno:", error);
    res.status(500).json({
      success: false,
      message: "Error al matricular alumno.",
      error: error.message
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
    res.status(500).json({ success: false, message: "Error al obtener alumnos.", error: error.message });
  }
}

// Editar datos de alumno
export async function editarAlumno(req, res) {
  try {
    const { id } = req.params;
    const datosAEditar = req.body;

    const alumnoActualizado = await editarAlumnoService(parseInt(id), datosAEditar);

    if (!alumnoActualizado) {
      return res.status(404).json({
        success: false,
        message: "Alumno no encontrado."
      });
    }

    res.status(200).json({
      success: true,
      message: "Alumno actualizado correctamente.",
      data: alumnoActualizado
    });
  } catch (error) {
    console.error("Error al editar alumno:", error);
    res.status(500).json({
      success: false,
      message: "Error al editar alumno.",
      error: error.message
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
    const { id_alumno, id_plan_definitivo } = req.body;

    const matriculado = await matricularAlumnoService(
      id_alumno,
      id_plan_definitivo,
    );
    if (!matriculado) {
      return res.status(404).json({ message: "Alumno no encontrado." });
    }

    res
      .status(200)
      .json({ message: "Alumno matriculado exitosamente.", data: matriculado });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al procesar la matrícula.",
        error: error.message,
      });
  }
}

// Auto-registro de alumno (registro público)
export async function autoRegistroAlumno(req, res) {
  try {
    const { email, password, nombre, rut, telefono, sexo, comuna, id_plan_interes } = req.body;

    if (!email || !password || !nombre || !rut) {
      return res.status(400).json({
        success: false,
        message: "Email, contraseña, nombre y RUT son obligatorios."
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
      id_plan_interes
    });

    res.status(201).json({
      success: true,
      message: "Alumno registrado correctamente.",
      data: alumno
    });
  } catch (error) {
    console.error("Error en auto-registro:", error);
    res.status(500).json({
      success: false,
      message: "Error en el auto-registro.",
      error: error.message
    });
  }
}

// Asignar sede masiva
export async function asignarSedeMasiva(req, res) {
  try {
    // 1. Extraemos de forma inteligente (aceptamos snake_case del front o camelCase del back)
    const alumnosIds = req.body.alumnosIds || req.body.alumnos_ids;
    const idSede = req.body.idSede || req.body.id_sede;

    // 2. Validación estricta
    if (!alumnosIds || !Array.isArray(alumnosIds) || !idSede) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos: alumnosIds (array) e idSede son obligatorios."
      });
    }

    // 3. Pasamos los datos validados a tu servicio
    const cantidadActualizada = await asignarSedeMasivaPorIdsService(alumnosIds, idSede);

    res.status(200).json({
      success: true,
      message: `Sede asignada correctamente a ${cantidadActualizada} alumno(s).`,
      data: { cantidadActualizada }
    });
  } catch (error) {
    console.error("Error al asignar sede masiva:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al asignar sede.",
      error: error.message
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
      return res.status(404).json({ success: false, message: "Alumno no encontrado." });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Contraseña reiniciada exitosamente a: ${nuevaPassword}` 
    });

  } catch (error) {
    console.error("Error al reiniciar contraseña:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
}

export async function eliminarAlumnosMasivo(req, res) {
  try {
    const alumnosIds = req.body.alumnosIds || req.body.alumnos_ids;

    if (!alumnosIds || !Array.isArray(alumnosIds) || alumnosIds.length === 0) {
      return res.status(400).json({ success: false, message: "Debe proporcionar un array de IDs de alumnos." });
    }

    const cantidadEliminada = await eliminarAlumnosPorIdsService(alumnosIds);

    res.status(200).json({
      success: true,
      message: `Se han eliminado ${cantidadEliminada} alumno(s) correctamente.`
    });
  } catch (error) {
    console.error("Error al eliminar alumnos:", error);
    res.status(500).json({ success: false, message: "Error interno al eliminar alumnos." });
  }
}
