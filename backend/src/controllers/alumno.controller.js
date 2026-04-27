"use strict";
import {
  seleccionarPlanInteresService,
  matricularAlumnoService,
} from "../services/alumno.service.js";

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
