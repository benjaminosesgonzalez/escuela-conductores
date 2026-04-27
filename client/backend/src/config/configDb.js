"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, PASSWORD, DB_PORT } from "./configEnv.js";

// IMPORTANTE: Verifica que estos nombres coincidan con tus archivos .entity.js
import { User } from "../entities/user.entity.js";
import { Administracion } from "../entities/administracion.entity.js";
import { Plan } from "../entities/plan.entity.js";
import bcrypt from "bcrypt";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: `${HOST}`,
  port: DB_PORT,
  username: `${DB_USERNAME}`,
  password: `${PASSWORD}`,
  database: `${DATABASE}`,
  entities: ["src/entities/**/*.js"],
  synchronize: true,
  logging: false,
});

async function seedAdmin() {
  // Ahora que están importados arriba, ya no darán ReferenceError
  const userRepository = AppDataSource.getRepository(User);
  const adminProfileRepo = AppDataSource.getRepository(Administracion);

  const adminExists = await userRepository.findOneBy({ rol: "administracion" });

  if (!adminExists) {
    console.log("=> No se detectó administrador. Creando admin inicial...");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const newUser = userRepository.create({
      email: "admin@escuela.com",
      password: hashedPassword,
      rol: "administracion",
    });
    const savedUser = await userRepository.save(newUser);

    // Usamos el repositorio de Administracion
    const newAdminProfile = adminProfileRepo.create({
      nombre: "Administrador Sistema",
      id_user: savedUser.id,
    });
    await adminProfileRepo.save(newAdminProfile);

    console.log("=> Admin inicial creado: admin@escuela.com / admin123");
  }
}

export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión exitosa a la base de datos PostgreSQL!");

    await seedAdmin(); // Ejecuta la creación del admin
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}
