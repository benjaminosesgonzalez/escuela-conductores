import { AppDataSource } from "../config/configDb.js";
import { Secretaria } from "../entities/secretaria.entity.js";
import { User } from "../entities/user.entity.js";

const secretariaRepo = AppDataSource.getRepository(Secretaria);
const userRepo = AppDataSource.getRepository(User);

export const getSecretariasService = async () => {
  // Usamos find() para traer un arreglo con todas las secretarias
  return await secretariaRepo.find({
    // relations le indica a TypeORM que haga un JOIN (cruce de tablas) con la tabla User
    relations: ["user"], // Para ver su email y fecha de creación
  });
};

export const getSecretariaByIdService = async (id) => {
  //busca un registro unico que coincida con la id
  return await secretariaRepo.findOne({
    where: { id },
    relations: ["user"],
  });
};

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

export const deleteSecretariaService = async (id) => {
  // Paso 1: Buscamos el perfil de la secretaria incluyendo su relación con User
  // Necesitamos hacer esto para capturar el 'id' del usuario maestro antes de que se borre
  const secretaria = await secretariaRepo.findOne({
    where: { id: idNumerico },
    relations: ["user"],
  });

  //si no se encuentra detenemos
  if (!secretaria) {
    console.log(`No se encontró secretaria con ID: ${idNumerico}`);
    return null;
  }

  //rescatamaos el id del usuario maestro para eliminarlo después
  const userId = secretaria.user?.id;

  // Paso 2: Eliminamos explícitamente el PERFIL de la secretaria
  // El método remove() elimina la entidad que le pasamos
  await secretariaRepo.remove(secretaria);

  // Paso 3: Eliminamos explícitamente la CUENTA DE USUARIO (Zero-Trust / Cuentas fantasma)
  // Usamos delete() pasando solo el ID, es más rápido y no requiere cargar la entidad completa
  if (userId) {
    await userRepo.delete(userId);
    console.log(`Cuenta maestra de User (ID: ${userId}) eliminada explícitamente.`);
  }
  return true;
};
