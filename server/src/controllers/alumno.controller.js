"use strict";
import {
  seleccionarPlanInteresService,
  matricularAlumnoService,
  matricularNuevoAlumnoService,
  editarAlumnoService,
  autoRegistroAlumnoService,
  asignarSedeMasivaPorIdsService
} from "../services/alumno.service.js";

// Matricular nuevo alumno (por secretaria)
export async function matricularNuevoAlumno(req, res) {
  try {
    const { email, password, nombre, rut, telefono, sexo, comuna, sede, id_plan_matriculado } = req.body;

    if (!email || !password || !nombre || !rut) {
      return res.status(400).json({
        success: false,
        message: "Email, contraseña, nombre y RUT son obligatorios."
      });
    }

    const alumno = await matricularNuevoAlumnoService({
      email,
      password,
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
      message: "Alumno matriculado correctamente.",
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
    const { alumnosIds, idSede } = req.body;

    if (!alumnosIds || !Array.isArray(alumnosIds) || !idSede) {
      return res.status(400).json({
        success: false,
        message: "alumnosIds (array) e idSede son obligatorios."
      });
    }

    const cantidadActualizada = await asignarSedeMasivaPorIdsService(alumnosIds, idSede);

    res.status(200).json({
      success: true,
      message: `${cantidadActualizada} alumno(s) actualizado(s).`,
      data: { cantidadActualizada }
    });
  } catch (error) {
    console.error("Error al asignar sede masiva:", error);
    res.status(500).json({
      success: false,
      message: "Error al asignar sede.",
      error: error.message
    });
  }
}
