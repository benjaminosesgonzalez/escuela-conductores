import { AppDataSource } from "../config/configDb.js";
import { Secretaria } from "../entities/secretaria.entity.js";

const secretariaRepo = AppDataSource.getRepository(Secretaria);

export const getSecretariasService = async () => {
  return await secretariaRepo.find({
    relations: ["user"], // Para ver su email y fecha de creación
  });
};

export const getSecretariaByIdService = async (id) => {
  return await secretariaRepo.findOne({
    where: { id },
    relations: ["user"],
  });
};

export const updateSecretariaService = async (id, data) => {
  const secretaria = await secretariaRepo.findOneBy({ id });
  if (!secretaria) return null;

  secretariaRepo.merge(secretaria, data);
  return await secretariaRepo.save(secretaria);
};

export const deleteSecretariaService = async (id) => {
  // Buscamos la secretaria con su usuario para que la eliminación sea completa
  const secretaria = await secretariaRepo.findOne({
    where: { id },
    relations: ["user"],
  });

  if (!secretaria) return null;

  // Al eliminar la entidad secretaria, TypeORM se encarga del User si está configurado en CASCADE
  // o podemos hacerlo manualmente para asegurar integridad
  return await secretariaRepo.remove(secretaria);
};
