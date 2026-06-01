"use strict";
import {
  seleccionarPlanInteresService,
  matricularAlumnoService,
  matricularNuevoAlumnoService,
  editarAlumnoService
} from "../services/alumno.service.js";

export async function editarAlumno(req, res) {
  try {
    const { id } = req.params; //se rescata el id de la url
    const datosAEditar = req.body;

    //seguridad: evitar que alguien cambie a que User pertenece este alumno
    delete datosAEditar.id_user;

    const alumnoActualizado = await editarAlumnoService(parseInt(id), datosAEditar);

    if(!alumnoActualizado) {
      return res.status(404).json({ message: "No se encontro un alumno con ese ID." });
    }

    res.status(200).json({
      message: "Datos del alumno actualizados correctamente.",
      data: alumnoActualizado
    });

  } catch(error) {
    if (error.code === '23505') { // Código de error de duplicidad en PostgreSQL
      return res.status(409).json({
        message: "El RUT ya se encuentra registrado en el sistema."
      });
    }

    res.status(500).json({
      message: "Error interno al actualizar los datos del alumno.",
      error: error.message
    });
  } 
}

export async function matricularNuevoAlumno(req, res){
  try {
    const {
      nombre,
      rut,
      sexo,
      comuna,
      telefono,
      email,
      sede,
      id_plan_matriculado
    } = req.body;

    // Validación básica
    if (!nombre || !rut || !email || !id_plan_matriculado) {
      return res.status(400).json({ 
        message: "Faltan campos obligatorios (nombre, rut, email, plan)." 
      });
    }

    // Generamos una contraseña por defecto usando los primeros 4 dígitos del RUT
    // Ejemplo: Si el rut es 19234567-8, la clave será "1923"
    const defaultPassword = rut.substring(0, 4);

    const payload = {
      email,
      password: defaultPassword,
      nombre,
      rut,
      telefono,
      sexo,
      comuna,
      sede,
      id_plan_matriculado
    };

    const nuevoAlumno = await matricularNuevoAlumnoService(payload);

    res.status(201).json({
      message: "Alumno registrado y matriculado exitosamente.",
      data: nuevoAlumno,
      nota: `El usuario del alumno fue creado. Su contraseña temporal son los primeros 4 dígitos del RUT.`
    });

  } catch (error) {
    // Manejo de errores comunes como duplicidad de Unique Keys
    if (error.code === '23505') { // Código de error de duplicidad en PostgreSQL
      return res.status(409).json({
        message: "El RUT o Correo Electrónico ya se encuentra registrado en el sistema."
      });
    }

    res.status(500).json({
      message: "Error interno al registrar el alumno.",
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
