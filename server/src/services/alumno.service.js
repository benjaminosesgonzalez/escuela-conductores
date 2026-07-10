"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Alumno } from "../entities/alumno.entity.js";
import { User } from "../entities/user.entity.js";
import { Sede } from "../entities/sede.entity.js";
import bcrypt from "bcrypt";
import { In } from "typeorm";
import { DisponibilidadAlumno } from "../entities/disponibilidad-alumno.entity.js";

const alumnoRepo = AppDataSource.getRepository(Alumno);

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

        const disponibilidad = queryRunner.manager.create(
          DisponibilidadAlumno,
          {
            alumnoId,
            diaSemana: dia,
            horaInicio: inicio,
            horaFin: fin,
            disponible: false,
          },
        );

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

  const alumnoRepo = AppDataSource.getRepository(Alumno);
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
      id_plan_matriculado,
    } = datosGenerales;

    // 1. Encriptar la contraseña generada
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Crear y guardar el Usuario (Tabla users)
    const newUser = queryRunner.manager.create(User, {
      email,
      password: hashedPassword,
      rol: "alumno",
    });
    const savedUser = await queryRunner.manager.save(User, newUser);

    // 3. Crear y guardar el Alumno vinculado al Usuario
    const newAlumno = queryRunner.manager.create(Alumno, {
      email,
      password: hashedPassword,
      nombre,
      rut,
      telefono,
      sexo,
      comuna,
      sede: sede, // Asegúrate de que coincida con tu entidad (id_sede vs sede)
      id_user: savedUser.id,
      id_plan_matriculado,
      estado_matricula: "matriculado",
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
      relations: ["user"],
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

export async function matricularAlumnoService(idUsuario, idPlanDefinitivo) {
  try {
    const alumnoRepository = AppDataSource.getRepository(Alumno);

    // 🔥 EL CAMBIO CLAVE: Buscamos por la columna que lo vincula al Usuario ('id_user')
    // Nota: Usamos 'findOne' con 'where' que es más seguro para claves foráneas en TypeORM
    const alumno = await alumnoRepository.findOne({
      where: { id_user: idUsuario },
    });

    // 💡 NOTA DE SEGURIDAD: Si en tu entidad de TypeORM declaraste 'id_user' como una relación
    // de objeto llamada 'user', la línea de arriba se escribe así:
    // const alumno = await alumnoRepository.findOne({ where: { user: { id: idUsuario } } });

    if (!alumno) {
      console.warn(
        `⚠️ No se encontró ninguna ficha de alumno vinculada al id_user: ${idUsuario}`,
      );
      return null;
    }

    // Guardamos los datos de matrícula reales
    alumno.id_plan_matriculado = idPlanDefinitivo;
    alumno.estado_matricula = "matriculado";

    // 🚀 Sincronizamos también el interés para que deje de quedar en null
    alumno.id_plan_interes = idPlanDefinitivo;

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
      id_plan_interes,
    } = datosRegistro;

    // 1. Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Crear credenciales (User)
    const newUser = queryRunner.manager.create(User, {
      email,
      password: hashedPassword,
      rol: "alumno",
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
      estado_matricula: "pendiente",
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

export const asignarSedeMasivaPorIdsService = async (
  alumnosIdsArray,
  idSede,
) => {
  const alumnoRepository = AppDataSource.getRepository(Alumno);
  const resultado = await alumnoRepository.update(
    { id: In(alumnosIdsArray) },
    { id_sede: idSede },
  );

  return resultado.affected;
};

export async function getAlumnosService() {
  const alumnoRepository = AppDataSource.getRepository(Alumno);
  const alumnos = await alumnoRepository.find({
    relations: ["user"],
  });
  return await alumnoRepository.find({
    relations: ["user", "sede"],
    order: { id: "DESC" },
  });
}

export async function resetPasswordAlumnoService(id) {
  const alumnoRepository = AppDataSource.getRepository(Alumno);
  const userRepository = AppDataSource.getRepository(User);

  // 1. Buscamos al alumno
  const alumno = await alumnoRepository.findOne({
    where: { id: parseInt(id) },
    relations: ["user"],
  });

  if (!alumno) return null; // Si no existe, retornamos null

  // 2. Generamos la nueva contraseña (últimos 5 dígitos del RUT)
  const rutLimpio = alumno.rut.replace(/[^0-9kK]/g, "");
  const nuevaPassword = rutLimpio.slice(-5);

  // 3. Encriptamos
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(nuevaPassword, saltRounds);

  // 4. Guardamos en la tabla User
  alumno.user.password = hashedPassword;
  await userRepository.save(alumno.user);

  // 5. Guardamos en la tabla Alumno
  alumno.password = hashedPassword;
  await alumnoRepository.save(alumno);

  // Retornamos la nueva clave en texto plano SOLO para mostrársela a la secretaria en el alert
  return nuevaPassword;
}

export const eliminarAlumnosPorIdsService = async (alumnosIdsArray) => {
  const alumnoRepository = AppDataSource.getRepository(Alumno);
  const userRepository = AppDataSource.getRepository(User);

  // 1. Buscamos los alumnos con sus usuarios asociados
  const alumnos = await alumnoRepository.find({
    where: { id: In(alumnosIdsArray) },
    relations: ["user"],
  });

  if (alumnos.length === 0) return 0;

  // 2. Extraemos los IDs de los usuarios asociados
  const usersIds = alumnos.map((alum) => alum.user.id);

  // 3. Eliminamos primero los alumnos (por la llave foránea)
  await alumnoRepository.delete(alumnosIdsArray);

  // 4. Eliminamos los usuarios de la tabla 'users'
  await userRepository.delete(usersIds);

  return alumnos.length;
};
