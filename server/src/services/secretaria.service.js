import { AppDataSource } from "../config/configDb.js";
import { Secretaria } from "../entities/secretaria.entity.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

const secretariaRepo = AppDataSource.getRepository(Secretaria);
const userRepo = AppDataSource.getRepository(User);

// Registrar nueva secretaria
export const registrarSecretariaService = async (datosSecretaria) => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { email, password, nombre, telefono } = datosSecretaria;

    if (!email || !password || !nombre) {
      throw new Error("Email, contraseña y nombre son obligatorios");
    }

    // 1. Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Crear y guardar el Usuario con rol "secretaria"
    const newUser = queryRunner.manager.create(User, {
      email,
      password: hashedPassword,
      rol: "secretaria"
    });
    const savedUser = await queryRunner.manager.save(User, newUser);

    // 3. Crear y guardar la Secretaria vinculada al Usuario
    const newSecretaria = queryRunner.manager.create(Secretaria, {
      nombre,
      telefono: telefono || null,
      id_user: savedUser.id
    });
    const savedSecretaria = await queryRunner.manager.save(Secretaria, newSecretaria);

    await queryRunner.commitTransaction();

    return {
      id: savedSecretaria.id,
      nombre: savedSecretaria.nombre,
      telefono: savedSecretaria.telefono,
      rol: "secretaria"
    };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error al registrar secretaria:", error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

// Obtener todas las secretarias
export const getSecretariasService = async () => {
  return await secretariaRepo.find({
    relations: ["user"],
  });
};

// Obtener secretaria por ID
export const getSecretariaByIdService = async (id) => {
  return await secretariaRepo.findOne({
    where: { id },
    relations: ["user"],
  });
};

// Actualizar secretaria
export const updateSecretariaService = async (id, data) => {
  const secretaria = await secretariaRepo.findOneBy({ id });
  if (!secretaria) return null;

  secretariaRepo.merge(secretaria, data);
  return await secretariaRepo.save(secretaria);
};

// Eliminar secretaria
export const deleteSecretariaService = async (id) => {
  const secretaria = await secretariaRepo.findOne({
    where: { id },
    relations: ["user"],
  });

  if (!secretaria) {
    console.log(`No se encontró secretaria con ID: ${id}`);
    return null;
  }

  const userId = secretaria.user?.id;

  await secretariaRepo.remove(secretaria);

  if (userId) {
    await userRepo.delete(userId);
    console.log(`Cuenta maestra de User (ID: ${userId}) eliminada explícitamente.`);
  }
  return true;
};
