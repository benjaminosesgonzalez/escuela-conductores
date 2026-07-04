"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Alumno } from "../entities/alumno.entity.js";
import { User } from "../entities/user.entity.js";
import { Sede } from "../entities/sede.entity.js";
import bcrypt from "bcrypt";
import { In } from "typeorm";

const alumnoRepo = AppDataSource.getRepository(Alumno);

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
    const userRepository = AppDataSource.getRepository(User);

    //1. buscamos a alumno incluyendo su relacion con el user
    const alumno = await alumnoRepository.findOne({
       where: { id: idAlumno },
       relations: ["user"] //trae los datos de la tabla users 
    });

    if(!alumno) return null;

    //2. si viene un email en los datos, lo separamos y lo actualizamos con la tabla User
    if (datosAEditar.email) {
      alumno.user.email = datosAEditar.email;
      await userRepository.save(alumno.user); //guardamos los cambios en la tabla User
      delete datosAEditar.email;  // Eliminamos el email de los datos a editar del alumno para no generar conflicto con la entidad Alumno
    }

    //3. actualizamos el resto de datos en la tabla Alumno
    //Se mezclan los datos actuales del alumno con los nuevos datos a editar
    Object.assign(alumno, datosAEditar);

    //4. al hacer save, se guardan los cambios tanto en Alumno como en User gracias a la relación establecida entre ambas entidades
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

export async function autoRegistroAlumnoService(datosRegistro) {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { 
      email, 
      password, //la contraseña la define el alumno
      nombre, 
      rut, 
      telefono, 
      sexo,
      comuna,
      id_plan_interes // Opcional, por si selecciona un plan en la web
    } = datosRegistro;

    // 1. Encriptar la contraseña elegida por el alumno
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Crear credenciales (User)
    const newUser = queryRunner.manager.create(User, {
      email,
      password: hashedPassword,
      rol: "alumno" // Forzamos el rol para que no puedan inyectar "administrador"
    });
    const savedUser = await queryRunner.manager.save(User, newUser);

    // 3. Crear ficha académica (Alumno)
    const newAlumno = queryRunner.manager.create(Alumno, {
      nombre,
      rut,
      telefono,
      sexo,
      comuna,
      id_user: savedUser.id,
      id_plan_interes: id_plan_interes || null, 
      estado_matricula: "pendiente" // Entra en estado pendiente
    });
    const savedAlumno = await queryRunner.manager.save(Alumno, newAlumno);

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

export async function asignarSedeAlumnoService(idAlumno, idSede) {
  const alumnoRepository = AppDataSource.getRepository(Alumno);
  const sedeRepository = AppDataSource.getRepository(Sede);

  //validar sede
  const sedeExiste = await sedeRepository.findOneBy({ id: idSede });
  if (!sedeExiste) throw new Error("La sede especificada no existe.");

  //validar alumno
  const alumno = await alumnoRepository.findOneBy({ id: idAlumno });
  if (!alumno) throw new Error("El alumno especificado no existe.");

  //asignar sede
  alumno.id_sede = idSede;
  return await alumnoRepository.save(alumno);
}

export const asignarSedeMasivaPorIdsService = async (alumnosIdsArray, idSede) => {
  //usamos el metodo uptade() nativo de In()
  const resultado = await alumnoRepo.update(
    { id: In(alumnosIdsArray) }, // Condición: actualizar todos los alumnos cuyos IDs estén en el arreglo
    { id_sede: idSede } // Nuevo valor para la columna id_sede
  );

  //affected nos devuelve el numero exacto de filas que la bdd reporta como nodificadas
  return resultado.affected;
}