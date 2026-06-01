"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Alumno } from "../entities/alumno.entity.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

export async function matricularNuevoAlumnoService(datosGenerales) {
  const queryRunner = AppDataSource.createQueryRunner();
  
  // Iniciamos la transacción
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { 
      email, 
      password, // Asignada por defecto o ingresada por la secretaria
      nombre, 
      rut, 
      telefono, 
      sexo, 
      comuna, 
      sede, 
      id_plan_matriculado 
    } = datosGenerales;

    // 1. Encriptar la contraseña antes de guardar el usuario
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Crear y guardar el Usuario
    const newUser = queryRunner.manager.create(User, {
      email,
      password: hashedPassword,
      rol: "alumno"
    });
    const savedUser = await queryRunner.manager.save(User, newUser);

    // 3. Crear y guardar el Alumno vinculado al Usuario recién creado
    const newAlumno = queryRunner.manager.create(Alumno, {
      nombre,
      rut,
      telefono,
      sexo,
      comuna,
      sede,
      id_user: savedUser.id, // Enlazamos con la FK
      id_plan_matriculado,
      estado_matricula: "matriculado" // Pasa directo a matriculado
    });
    const savedAlumno = await queryRunner.manager.save(Alumno, newAlumno);

    // Si todo salió bien, aplicamos los cambios a la base de datos
    await queryRunner.commitTransaction();
    
    return savedAlumno;
  } catch (error) {
    // Si hay un error (ej. RUT o Email duplicado), deshacemos todo
    await queryRunner.rollbackTransaction();
    console.error("Error en la transacción de matrícula:", error);
    throw error; 
  } finally {
    // Liberamos el queryRunner
    await queryRunner.release();
  }
}

export async function editarAlumnoService(idAlumno, datosAEditar){
  try{
    const alumnoRepository = AppDataSource.getRepository(Alumno);
    const alumno = await alumnoRepository.findOneBy({ id: idAlumno });

    if(!alumno) return null;

    //Se mezclan los datos actuales del alumno con los nuevos datos a editar
    Object.assign(alumno, datosAEditar);

    return await alumnoRepository.save(alumno);
  }catch(error){
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
