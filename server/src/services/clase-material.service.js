import { AppDataSource } from "../config/configDb.js";

export const obtenerArchivosProfesor = async (profesorId) => {
  try {
    // Obtener todos los archivos del profesor desde repositorio_archivos
    const archivos = await AppDataSource.query(
      `SELECT * FROM repositorio_archivos ORDER BY "fechaSubida" DESC`
    );

    return archivos;
  } catch (error) {
    console.error("Error obteniendo archivos del profesor:", error);
    throw error;
  }
};

export const asignarMaterialAClasesDelDia = async (
  profesorId,
  fechaDia,
  repositorioArchivoId
) => {
  try {
    // Obtener todas las clases teóricas del profesor para esa fecha
    const clases = await AppDataSource.query(
      `SELECT id FROM clases_online
       WHERE "profesorId" = $1
       AND DATE(fecha) = DATE($2)
       AND "tipoDisponibilidad" = 'teorica'`,
      [profesorId, fechaDia]
    );

    if (clases.length === 0) {
      return {
        success: false,
        message: "No hay clases para este día",
      };
    }

    // Asignar el archivo a todas las clases del día
    for (const clase of clases) {
      await AppDataSource.query(
        `INSERT INTO clase_material ("claseId", "repositorioArchivoId", "createdAt")
         VALUES ($1, $2, NOW())
         ON CONFLICT DO NOTHING`,
        [clase.id, repositorioArchivoId]
      );
    }

    return {
      success: true,
      message: `Material asignado a ${clases.length} clase(s)`,
      clasesAfectadas: clases.length,
    };
  } catch (error) {
    console.error("Error asignando material:", error);
    throw error;
  }
};

export const obtenerMaterialesDeClase = async (claseId) => {
  try {
    // Obtener todos los archivos asociados a una clase
    const materiales = await AppDataSource.query(
      `SELECT ra.id, ra."nombreOriginal" as nombre, ra."tipoArchivo" as tipo,
              ra."rutaArchivo", ra."fechaSubida", cm."createdAt" as asignadoEn
       FROM clase_material cm
       JOIN repositorio_archivos ra ON cm."repositorioArchivoId" = ra.id
       WHERE cm."claseId" = $1
       ORDER BY cm."createdAt" DESC`,
      [claseId]
    );

    return materiales;
  } catch (error) {
    console.error("Error obteniendo materiales de clase:", error);
    throw error;
  }
};

export const eliminarMaterialDeClase = async (claseId, repositorioArchivoId) => {
  try {
    await AppDataSource.query(
      `DELETE FROM clase_material
       WHERE "claseId" = $1 AND "repositorioArchivoId" = $2`,
      [claseId, repositorioArchivoId]
    );

    return {
      success: true,
      message: "Material eliminado de la clase",
    };
  } catch (error) {
    console.error("Error eliminando material:", error);
    throw error;
  }
};
