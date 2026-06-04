import { AppDataSource } from "../config/configDb.js";
import { Profesor } from "../entities/profesor.entity.js";

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
