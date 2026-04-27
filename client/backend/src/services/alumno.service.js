"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Alumno } from "../entities/alumno.entity.js";

export async function seleccionarPlanInteresService(idUsuario, idPlan) {
  try {
    const alumnoRepository = AppDataSource.getRepository(Alumno);
    const alumno = await alumnoRepository.findOneBy({ id_usuario: idUsuario });

    if (!alumno) return null;

    alumno.id_plan_interes = idPlan;
    return await alumnoRepository.save(alumno);
  } catch (error) {
    console.error("Error al seleccionar plan de interés:", error);
    return null;
  }
}

export async function matricularAlumnoService(idAlumno, idPlanDefinitivo) {
  try {
    const alumnoRepository = AppDataSource.getRepository(Alumno);
    const alumno = await alumnoRepository.findOneBy({ id: idAlumno });

    if (!alumno) return null;

    alumno.id_plan_matriculado = idPlanDefinitivo;
    alumno.estado_matricula = "matriculado";

    return await alumnoRepository.save(alumno);
  } catch (error) {
    console.error("Error al matricular alumno:", error);
    return null;
  }
}
