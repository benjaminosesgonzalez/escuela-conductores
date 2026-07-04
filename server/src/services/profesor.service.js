import { AppDataSource } from "../config/configDb.js";
import { Profesor } from "../entities/profesor.entity.js";
import { In } from "typeorm";

const profRepo = AppDataSource.getRepository(Profesor);

export const getProfesoresService = async () => {
  // Usamos 'relations' para traer también la info de sus sedes y su email
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

  // Si vienen sedes, las mapeamos para actualizar la tabla intermedia
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

  // Al eliminar al profesor, también eliminamos su usuario (CASCADE)
  return await profRepo.remove(profesor);
};

export const asignarSedesProfesorService = async (idProfesor, sedesIdsArray) => {
  const profesorRepository = AppDataSource.getRepository(Profesor);

  //buscar profesor
  const profesor = await profesorRepository.findOne({
    where: { id: idProfesor },
    relations: ["sedes"],
  });

  if (!profesor) throw new Error("Profesor no encontrado");

  //transformar array de ids a formato entidades
  const nuevasSedes = sedesIdsArray.map((id) => ({ id }));

  profesor.sedes = nuevasSedes;

  return await profesorRepository.save(profesor);
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
