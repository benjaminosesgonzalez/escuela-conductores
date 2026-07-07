"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Alumno } from "../entities/alumno.entity.js";
import { User } from "../entities/user.entity.js";
import { DisponibilidadAlumno } from "../entities/disponibilidad-alumno.entity.js";
import bcrypt from "bcrypt";
import { In } from "typeorm";

// Función auxiliar para generar bloques de disponibilidad
const minutosAHora = (minutos) => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const generarBloquesAlumnoAutomaticamente = async (queryRunner, alumnoId) => {
  try {
    const duracionClaseMinutos = 45;
    const breakMinutos = 15;
    const horaInicioMinutos = 9 * 60;
    const horaFinMinutos = 20 * 60;
    const diasLaboral = ["lunes", "martes", "miércoles", "jueves", "viernes"];

    const bloques = [];

    for (const dia of diasLaboral) {
      let horaActual = horaInicioMinutos;

      while (horaActual + duracionClaseMinutos <= horaFinMinutos) {
        const inicio = minutosAHora(horaActual);
        const fin = minutosAHora(horaActual + duracionClaseMinutos);

        const disponibilidad = queryRunner.manager.create(DisponibilidadAlumno, {
          alumnoId,
          diaSemana: dia,
          horaInicio: inicio,
          horaFin: fin,
          disponible: false
        });

        bloques.push(disponibilidad);
        horaActual += duracionClaseMinutos + breakMinutos;
      }
    }

    await queryRunner.manager.save(DisponibilidadAlumno, bloques);
    return bloques.length;
  } catch (error) {
    console.error("Error generando bloques automáticos:", error);
    throw error;
  }
};

export async function matricularNuevoAlumnoService(datosGenerales) {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const {
      email,
      password,
      nombre,
      rut,
      telefono,
      sexo,
      comuna,
      sede,
      id_plan_matriculado
    } = datosGenerales;

    // 1. Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Crear y guardar el Usuario
    const newUser = queryRunner.manager.create(User, {
      email,
      password: hashedPassword,
      rol: "alumno"
    });
    const savedUser = await queryRunner.manager.save(User, newUser);

    // 3. Crear y guardar el Alumno vinculado al Usuario (con contraseña hasheada)
    const newAlumno = queryRunner.manager.create(Alumno, {
      email,
      password: hashedPassword,
      nombre,
      rut,
      telefono,
      sexo,
      comuna,
      sede,
      id_user: savedUser.id,
      id_plan_matriculado,
      estado_matricula: "matriculado"
    });
    const savedAlumno = await queryRunner.manager.save(Alumno, newAlumno);

    // Generar bloques de disponibilidad automáticamente
    await generarBloquesAlumnoAutomaticamente(queryRunner, savedAlumno.id);

    await queryRunner.commitTransaction();

    return savedAlumno;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error en la transacción de matrícula:", error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

export async function editarAlumnoService(idAlumno, datosAEditar) {
  try {
    const alumnoRepository = AppDataSource.getRepository(Alumno);
    const userRepository = AppDataSource.getRepository(User);

    const alumno = await alumnoRepository.findOne({
      where: { id: idAlumno },
      relations: ["user"]
    });

    if (!alumno) return null;

    if (datosAEditar.email) {
      alumno.user.email = datosAEditar.email;
      await userRepository.save(alumno.user);
      delete datosAEditar.email;
    }

    Object.assign(alumno, datosAEditar);

    return await alumnoRepository.save(alumno);
  } catch (error) {
    console.error("Error al editar alumno:", error);
    throw error;
  }
}

export async function seleccionarPlanInteresService(idUser, idPlan) {
  try {
    const alumnoRepository = AppDataSource.getRepository(Alumno);
    const alumno = await alumnoRepository.findOneBy({ id_user: idUser });

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

export async function autoRegistroAlumnoService(datosRegistro) {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const {
      email,
      password,
      nombre,
      rut,
      telefono,
      sexo,
      comuna,
      id_plan_interes
    } = datosRegistro;

    // 1. Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Crear credenciales (User)
    const newUser = queryRunner.manager.create(User, {
      email,
      password: hashedPassword,
      rol: "alumno"
    });
    const savedUser = await queryRunner.manager.save(User, newUser);

    // 3. Crear ficha académica (Alumno) con contraseña hasheada
    const newAlumno = queryRunner.manager.create(Alumno, {
      email,
      password: hashedPassword,
      nombre,
      rut,
      telefono,
      sexo,
      comuna,
      id_user: savedUser.id,
      id_plan_interes: id_plan_interes || null,
      estado_matricula: "pendiente"
    });
    const savedAlumno = await queryRunner.manager.save(Alumno, newAlumno);

    // Generar bloques de disponibilidad automáticamente
    await generarBloquesAlumnoAutomaticamente(queryRunner, savedAlumno.id);

    await queryRunner.commitTransaction();
    return savedAlumno;

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error en el auto-registro:", error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

export const asignarSedeMasivaPorIdsService = async (alumnosIdsArray, idSede) => {
  const alumnoRepository = AppDataSource.getRepository(Alumno);
  const resultado = await alumnoRepository.update(
    { id: In(alumnosIdsArray) },
    { sede: idSede }
  );

  return resultado.affected;
}
