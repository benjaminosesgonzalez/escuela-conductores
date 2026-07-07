import { AppDataSource } from "../config/configDb.js";
import { DisponibilidadSchema } from "../entities/disponibilidad.entity.js";
import { generarBloquesDisponibilidad } from "./disponibilidad.service.js";

const disponibilidadRepository = AppDataSource.getRepository(DisponibilidadSchema);

/**
 * Regenera los bloques de disponibilidad para un profesor específico
 * Elimina bloques antiguos sin fechas y genera nuevos para 2 semanas
 */
export const regenerarBloquesProfesor = async (profesorId) => {
  try {
    console.log(`\n🔄 Regenerando bloques para profesor ${profesorId}...`);

    // Obtener información del profesor
    const profesor = await AppDataSource.query(
      `SELECT * FROM profesores WHERE id = $1`,
      [profesorId]
    );

    if (profesor.length === 0) {
      return { success: false, message: "Profesor no encontrado" };
    }

    const tipoContrato = profesor[0].tipo_contrato || "full_time";

    // Eliminar bloques existentes sin fecha (bloques antiguos)
    const bloquesAntiguos = await AppDataSource.query(
      `DELETE FROM disponibilidades
       WHERE "profesorId" = $1 AND fecha IS NULL`,
      [profesorId]
    );

    console.log(`🗑️ Bloques antiguos eliminados: ${bloquesAntiguos[1]}`);

    // Generar nuevos bloques para 2 semanas
    const result = await generarBloquesDisponibilidad(
      profesorId,
      tipoContrato,
      ["lunes", "martes", "miércoles", "jueves", "viernes"]
    );

    console.log(`✅ Bloques regenerados para profesor ${profesorId}`);
    return { success: true, ...result };
  } catch (error) {
    console.error("❌ Error regenerando bloques:", error);
    throw error;
  }
};

/**
 * Regenera bloques para TODOS los profesores
 */
export const regenerarTodosLosBloque = async () => {
  try {
    console.log("\n🔄 Regenerando bloques para TODOS los profesores...");

    // Obtener todos los profesores
    const profesores = await AppDataSource.query(
      `SELECT id, nombre FROM profesores ORDER BY id`
    );

    if (profesores.length === 0) {
      return { success: false, message: "No hay profesores en el sistema" };
    }

    console.log(`📋 Total de profesores: ${profesores.length}`);

    let regenerados = 0;
    const errores = [];

    for (const profesor of profesores) {
      try {
        await regenerarBloquesProfesor(profesor.id);
        regenerados++;
        console.log(`✅ ${profesor.nombre} (ID: ${profesor.id})`);
      } catch (error) {
        errores.push({
          profesorId: profesor.id,
          nombre: profesor.nombre,
          error: error.message
        });
        console.error(`❌ Error con ${profesor.nombre}:`, error.message);
      }
    }

    console.log(`\n✨ Resultado: ${regenerados}/${profesores.length} profesores regenerados`);

    if (errores.length > 0) {
      console.log("Errores encontrados:", errores);
    }

    return {
      success: errores.length === 0,
      regenerados,
      total: profesores.length,
      errores
    };
  } catch (error) {
    console.error("❌ Error regenerando bloques generales:", error);
    throw error;
  }
};

export default {
  regenerarBloquesProfesor,
  regenerarTodosLosBloque
};
