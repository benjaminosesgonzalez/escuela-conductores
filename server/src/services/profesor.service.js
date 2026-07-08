import { AppDataSource } from "../config/configDb.js";
import { ProfesorSchema } from "../entities/profesor.entity.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";
import { In } from "typeorm";

const profRepo = AppDataSource.getRepository(ProfesorSchema);
const userRepo = AppDataSource.getRepository(User);

export const getProfesoresService = async () => {
  return await profRepo.find({
    relations: ["sedes", "user"],
  });
};

export const getProfesorByIdService = async (id) => {
  return await profRepo.findOne({
    where: { id },
    relations: ["sedes", "user"],
  });
};

export const updateProfesorService = async (id, data) => {
  const profesor = await profRepo.findOneBy({ id });
  if (!profesor) return null;

  if (data.id_sedes) {
    profesor.sedes = data.id_sedes.map((idSede) => ({ id: idSede }));
  }

  profRepo.merge(profesor, data);
  return await profRepo.save(profesor);
};

export const deleteProfesorService = async (id) => {
  const profesor = await profRepo.findOne({
    where: { id },
    relations: ["user"],
  });
  if (!profesor) return null;

  return await profRepo.remove(profesor);
};

export const asignarSedesMasivaProfesoresService = async (profesoresIdsArray, sedesIdsArray) => {
  const profesores = await profRepo.find({
    where: { id: In(profesoresIdsArray) },
    relations: ["sedes"],
  });

  //si la consulta no encuentra a nadie, cortamos la ejecucion
  if (profesores.length === 0) return 0;

  //mapeamos el arreglo numerico a un formato de entidades legibles
  const nuevasSedes = sedesIdsArray.map((id) => ({ id }));

  //iteramos sobre cada profesor y le asignamos las sedes
  const profesoresActualizados = profesores.map((profesor) => {
    profesor.sedes = nuevasSedes;
    return profesor;
  });

  //guardamos todos los cambios en la base de datos
  await profRepo.save(profesoresActualizados);

  return profesoresActualizados.length;
};

export const eliminarProfesoresPorIdsService = async (profesoresIdsArray) => {
  const profRepository = AppDataSource.getRepository(Profesor);
  const userRepository = AppDataSource.getRepository(User);

  const profesores = await profRepository.find({
    where: { id: In(profesoresIdsArray) },
    relations: ["user"]
  });

  if (profesores.length === 0) return 0;

  const usersIds = profesores.map(prof => prof.user.id);

  // Eliminamos primero a los profesores para evitar conflictos de llaves
  await profRepository.delete(profesoresIdsArray);
  await userRepository.delete(usersIds);

  return profesores.length;
};

export const resetPasswordProfesorService = async (id) => {
  const profRepository = AppDataSource.getRepository(Profesor);
  const userRepository = AppDataSource.getRepository(User);

  const profesor = await profRepository.findOne({
    where: { id: parseInt(id) },
    relations: ["user"]
  });

  if (!profesor || !profesor.user) return null;

  // Extraemos los últimos 5 dígitos del RUT
  const rutLimpio = profesor.rut.replace(/[^0-9kK]/g, '');
  const nuevaPassword = rutLimpio.slice(-5);
  
  // Encriptamos
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(nuevaPassword, saltRounds);

  // Guardamos SOLO en la tabla User (el profesor no tiene columna password)
  profesor.user.password = hashedPassword;
  await userRepository.save(profesor.user);

  return nuevaPassword;
};
