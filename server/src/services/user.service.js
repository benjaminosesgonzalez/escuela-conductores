import { AppDataSource } from "../config/configDb.js";
import { User } from "../entities/user.entity.js";
import { Alumno } from "../entities/alumno.entity.js";
import { Profesor } from "../entities/profesor.entity.js";
import { Administracion } from "../entities/administracion.entity.js";
import bcrypt from "bcrypt";

const userRepository = AppDataSource.getRepository(User);

export async function createUser(data) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = userRepository.create({
    email: data.email,
    password: hashedPassword,
    rol: data.rol,
  });

  const savedUser = await userRepository.save(newUser);

  if (savedUser.rol === "alumno") {
    const repo = AppDataSource.getRepository(Alumno);
    await repo.save(
      repo.create({
        nombre: data.nombre,
        rut: data.rut,
        telefono: data.telefono,
        id_user: savedUser.id,
      }),
    );
  } else if (savedUser.rol === "profesor") {
    const repo = AppDataSource.getRepository(Profesor);
    await repo.save(
      repo.create({
        nombre: data.nombre,
        telefono: data.telefono,
        id_user: savedUser.id,
      }),
    );
  } else if (savedUser.rol === "administracion") {
    const repo = AppDataSource.getRepository(Administracion);
    await repo.save(
      repo.create({
        nombre: data.nombre,
        id_user: savedUser.id,
      }),
    );
  }

  return savedUser;
}

export async function findUserByEmail(email) {
  return await userRepository.findOneBy({ email });
}
