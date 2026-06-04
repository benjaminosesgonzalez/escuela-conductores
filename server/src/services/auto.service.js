import { AppDataSource } from "../config/configDb.js";
import { Auto } from "../entities/auto.entity.js";

const autoRepo = AppDataSource.getRepository(Auto);

export const createAutoService = async (data) => {
  const nuevoAuto = autoRepo.create(data);
  return await autoRepo.save(nuevoAuto);
};

export const getAutosService = async () => {
  return await autoRepo.find({ relations: ["sede"] });
};

export const getAutosBySedeService = async (idSede) => {
  const [autos, total] = await autoRepo.findAndCount({
    where: { sede: { id: idSede }, estado: "disponible" },
  });
  return { autos, totalDisponible: total };
};

export const updateAutoService = async (id, data) => {
  const auto = await autoRepo.findOneBy({ id });
  if (!auto) return null;
  autoRepo.merge(auto, data);
  return await autoRepo.save(auto);
};

export const deleteAutoService = async (id) => {
  return await autoRepo.delete(id);
};
