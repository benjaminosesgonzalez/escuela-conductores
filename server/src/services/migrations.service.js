import { AppDataSource } from "../config/configDb.js";

/**
 * Ejecutar migraciones SQL
 */
export const runMigrations = async () => {
  try {
    console.log("📦 Ejecutando migraciones...");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Migración 002: Eliminar tabla antigua disponibilidades
    const dropOldTableSQL = `
      DROP TRIGGER IF EXISTS trigger_sync_clase_online ON disponibilidades;
      DROP FUNCTION IF EXISTS sync_clase_online_with_disponibilidad();
      DROP TABLE IF EXISTS disponibilidades CASCADE;
    `;

    try {
      await queryRunner.query(dropOldTableSQL);
      console.log("✅ Tabla antigua disponibilidades eliminada");
    } catch (error) {
      if (error.message.includes("does not exist")) {
        console.log("ℹ️ Tabla disponibilidades ya no existe");
      } else {
        console.log("⚠️ Error durante migración:", error.message.substring(0, 100));
      }
    }

    // Migración 003: Agregar sedeId a clases_practicas
    const addSedeIdSQL = `
      ALTER TABLE clases_practicas
      ADD COLUMN "sedeId" INT,
      ADD CONSTRAINT fk_clases_practicas_sede
      FOREIGN KEY ("sedeId") REFERENCES sedes(id) ON DELETE SET NULL;
      CREATE INDEX idx_clases_practicas_sedeId ON clases_practicas("sedeId");
    `;

    try {
      await queryRunner.query(addSedeIdSQL);
      console.log("✅ Columna sedeId agregada a clases_practicas");
    } catch (error) {
      if (error.message.includes("already exists") || error.message.includes("duplicate")) {
        console.log("ℹ️ Columna sedeId ya existe en clases_practicas");
      } else {
        console.log("⚠️ Error durante migración 003:", error.message.substring(0, 100));
      }
    }

    await queryRunner.release();
    console.log("✅ Migraciones completadas");

  } catch (error) {
    console.error("❌ Error ejecutando migraciones:", error);
  }
};
