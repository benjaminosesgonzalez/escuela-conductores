"use strict";
import { DataSource } from "typeorm";
import { DATABASE, DB_USERNAME, HOST, PASSWORD, DB_PORT } from "./configEnv.js";

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
  const userRepository = AppDataSource.getRepository(User);
  const funcRepository = AppDataSource.getRepository(Funcionario);

  // Buscamos si existe algún usuario con el rol 'administracion'
  const adminExists = await userRepository.findOneBy({ rol: "administracion" });

  if (!adminExists) {
    console.log("=> No se detectó administrador. Creando admin inicial...");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    // 1. Creamos el usuario base
    const newUser = userRepository.create({
      email: "admin@escuela.com",
      password: hashedPassword,
      rol: "administracion",
    });
    const savedUser = await userRepository.save(newUser);

    // 2. Creamos su perfil de funcionario
    const newFunc = funcRepository.create({
      nombre: "Administrador Sistema",
      id_usuario: savedUser.id,
    });
    await funcRepository.save(newFunc);

    console.log("=> Admin inicial creado: admin@escuela.com / admin123");
  }
}
export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión exitosa a la base de datos PostgreSQL!");
    await seedAdmin();
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}
