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
  // Usamos find() para traer un arreglo con todas las secretarias
  return await secretariaRepo.find({
    // relations le indica a TypeORM que haga un JOIN (cruce de tablas) con la tabla User
    relations: ["user"], // Para ver su email y fecha de creación
  });
};

// Obtener secretaria por ID
export const getSecretariaByIdService = async (id) => {
  //busca un registro unico que coincida con la id
  return await secretariaRepo.findOne({
    where: { id },
    relations: ["user"],
  });
};

// Actualizar secretaria
export const updateSecretariaService = async (id, data) => {
  // Paso 1: Buscamos si existe el registro antes de intentar actualizarlo
  const secretaria = await secretariaRepo.findOneBy({ id });
  if (!secretaria) return null;

  // Paso 2: Usamos merge() de TypeORM. Esto toma el objeto original (secretaria) 
  // y le sobreescribe solo las propiedades que vengan en el objeto nuevo (data).
  secretariaRepo.merge(secretaria, data);
  // Paso 3: Guardamos el objeto fusionado en la base de datos
  return await secretariaRepo.save(secretaria);
};

// Eliminar secretaria
export const deleteSecretariaService = async (id) => {
  const secretaria = await secretariaRepo.findOne({
    where: { id },
    relations: ["user"],
  });

  //si no se encuentra detenemos
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
