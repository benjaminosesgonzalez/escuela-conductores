import { AppDataSource } from "../config/configDb.js";
import { ProfesorSchema } from "../entities/profesor.entity.js";
import { User } from "../entities/user.entity.js";
import bcrypt from "bcrypt";
import { In } from "typeorm";

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

export const asignarSedesMasivaProfesoresService = async (profesoresIdsArray, sedesIdsArray) => {
  const profesores = await profRepo.find({
    where: { id: In(profesoresIdsArray) },
    relations: ["sedes"],
  });

  //si la consulta no encuentra a nadie, cortamos la ejecucion
  if (profesores.length === 0) return 0;

  //mapeamos el arreglo numerico a un formato de entidades legibles
  const nuevasSedes = sedesIdsArray.map((id) => ({ id }));

  //iteramos sobre cada profesor y le asignamos las sedes
  const profesoresActualizados = profesores.map((profesor) => {
    profesor.sedes = nuevasSedes;
    return profesor;
  });

  //guardamos todos los cambios en la base de datos
  await profRepo.save(profesoresActualizados);

  return profesoresActualizados.length;
};

export const eliminarProfesoresPorIdsService = async (profesoresIdsArray) => {
  const profRepository = AppDataSource.getRepository(ProfesorSchema);
  const userRepository = AppDataSource.getRepository(User);

  const profesores = await profRepository.find({
    where: { id: In(profesoresIdsArray) },
    relations: ["user"]
  });

  if (profesores.length === 0) return 0;

  const usersIds = profesores.map(prof => prof.user.id);

  // Eliminamos primero a los profesores para evitar conflictos de llaves
  await profRepository.delete(profesoresIdsArray);
  await userRepository.delete(usersIds);

  return profesores.length;
};

export const resetPasswordProfesorService = async (id) => {
  const profRepository = AppDataSource.getRepository(Profesor);
  const userRepository = AppDataSource.getRepository(User);

  const profesor = await profRepository.findOne({
    where: { id: parseInt(id) },
    relations: ["user"]
  });

  if (!profesor || !profesor.user) return null;

  // Extraemos los últimos 5 dígitos del RUT
  const rutLimpio = profesor.rut.replace(/[^0-9kK]/g, '');
  const nuevaPassword = rutLimpio.slice(-5);

  // Encriptamos
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(nuevaPassword, saltRounds);

  // Guardamos SOLO en la tabla User (el profesor no tiene columna password)
  profesor.user.password = hashedPassword;
  await userRepository.save(profesor.user);

  return nuevaPassword;
};

export const obtenerAlumnosInscritosService = async (profesorId) => {
  try {
    const result = await AppDataSource.query(`
      SELECT COUNT(DISTINCT "alumnoId") as count
      FROM (
        SELECT DISTINCT coa."alumnoId"
        FROM clase_online_alumno coa
        JOIN clases_online co ON coa."claseOnlineId" = co.id
        WHERE co."profesorId" = $1
        UNION
        SELECT DISTINCT "alumnoId"
        FROM clases_practicas
        WHERE "profesorId" = $1 AND "alumnoId" IS NOT NULL
      ) as alumnos_distintos
    `, [profesorId]);

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error en obtenerAlumnosInscritosService:', error);
    return 0;
  }
};

export const obtenerClasesHoyService = async (profesorId) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const result = await AppDataSource.query(`
      SELECT COUNT(*) as count FROM (
        SELECT id FROM clases_online WHERE "profesorId" = $1 AND DATE(fecha) = $2
        UNION ALL
        SELECT id FROM clases_practicas WHERE "profesorId" = $1 AND DATE(fecha) = $2
      ) as todas_clases
    `, [profesorId, hoy]);

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error en obtenerClasesHoyService:', error);
    return 0;
  }
};

export const obtenerVehiculosReservadosService = async (profesorId) => {
  try {
    const result = await AppDataSource.query(`
      SELECT COUNT(DISTINCT v.id) as count
      FROM solicitud_vehiculos sv
      JOIN vehiculos v ON sv."vehiculoId" = v.id
      WHERE sv."profesorId" = $1 AND sv.estado = 'aprobado'
    `, [profesorId]);

    return result[0]?.count || 0;
  } catch (error) {
    console.error('Error en obtenerVehiculosReservadosService:', error);
    return 0;
  }
};

export const obtenerClasesDetalleHoyService = async (profesorId) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    // Clases online
    const clasesOnline = await AppDataSource.query(`
      SELECT
        co.id,
        co."horaInicio",
        co."horaFin",
        coa."alumnoId",
        a.nombre as alumno,
        'Teórica' as tipo,
        co."nombreTema" as codigo,
        'Zoom' as ubicacion,
        'teórica' as tipo_label
      FROM clases_online co
      JOIN clase_online_alumno coa ON co.id = coa."claseOnlineId"
      JOIN alumnos a ON coa."alumnoId" = a.id
      WHERE co."profesorId" = $1 AND DATE(co.fecha) = $2
      ORDER BY co."horaInicio"
    `, [profesorId, hoy]);

    // Clases prácticas
    const clasesPracticas = await AppDataSource.query(`
      SELECT
        cp.id,
        cp."horaInicio",
        cp."horaFin",
        cp."alumnoId",
        a.nombre as alumno,
        'Práctica' as tipo,
        '' as codigo,
        s.nombre as ubicacion,
        'práctica' as tipo_label
      FROM clases_practicas cp
      LEFT JOIN alumnos a ON cp."alumnoId" = a.id
      LEFT JOIN sedes s ON cp."sedeId" = s.id
      WHERE cp."profesorId" = $1 AND DATE(cp.fecha) = $2
      ORDER BY cp."horaInicio"
    `, [profesorId, hoy]);

    // Combinar y formatear
    const todasLasClases = [...clasesOnline, ...clasesPracticas].map(clase => ({
      id: clase.id,
      hora: `${clase.horaInicio} - ${clase.horaFin}`,
      alumno: clase.alumno,
      tipo: clase.tipo,
      codigo: clase.codigo,
      ubicacion: clase.ubicacion,
      tipo_label: clase.tipo_label
    })).sort((a, b) => a.hora.localeCompare(b.hora));

    return todasLasClases;
  } catch (error) {
    console.error('Error en obtenerClasesDetalleHoyService:', error);
    return [];
  }
};
