import { AppDataSource } from "../config/configDb.js";
import { Secretaria } from "../entities/secretaria.entity.js";

const secretariaRepo = AppDataSource.getRepository(Secretaria);

export const getSecretariasService = async () => {
  return await secretariaRepo.find({
    relations: ["user"],
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
  const idNumerico = parseInt(id);

  const secretaria = await secretariaRepo.findOne({
    where: { id: idNumerico },
    relations: ["user"],
  });

  if (!secretaria) {
    console.log(`❌ No se encontró secretaria con ID: ${idNumerico}`);
    return null;
  }

  return await secretariaRepo.remove(secretaria);
};
