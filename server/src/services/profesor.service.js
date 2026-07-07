import { AppDataSource } from "../config/configDb.js";
import { ProfesorSchema } from "../entities/profesor.entity.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";

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

export const registrarProfesorService = async (datosProfesor) => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const {
      email,
      password,
      nombre,
      telefono,
      tipo_contrato = "full_time"
    } = datosProfesor;

    // 1. Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Crear y guardar el Usuario
    const newUser = queryRunner.manager.create(User, {
      email,
      password: hashedPassword,
      rol: "profesor"
    });
    const savedUser = await queryRunner.manager.save(User, newUser);

    // 3. Crear y guardar el Profesor vinculado al Usuario
    const newProfesor = queryRunner.manager.create(ProfesorSchema, {
      email,
      password: hashedPassword,
      nombre,
      telefono,
      tipo_contrato
    });
    const savedProfesor = await queryRunner.manager.save(ProfesorSchema, newProfesor);

    await queryRunner.commitTransaction();

    return savedProfesor;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Error en la transacción de registro de profesor:", error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};
