import { AppDataSource } from "../config/configDb.js";

/**
 * Crear triggers de sincronización de clases online
 */
export const initializeTriggers = async () => {
  try {
    console.log("📋 Inicializando triggers...");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Crear función para sincronizar clases online
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION sync_clase_online_with_disponibilidad()
      RETURNS TRIGGER AS $$
      DECLARE
        v_clase_existente INTEGER;
        v_tema_numero INTEGER;
        v_tema_nombre VARCHAR;
        v_fecha_str VARCHAR;
        v_year INTEGER;
        v_month VARCHAR;
        v_day VARCHAR;
      BEGIN
        -- Solo procesar si disponible cambió
        IF NEW.disponible IS DISTINCT FROM OLD.disponible THEN

          -- Si disponible cambió a TRUE: crear clase online
          IF NEW.disponible = true AND OLD.disponible = false THEN
            -- Verificar si ya existe una clase online
            SELECT id INTO v_clase_existente FROM clases_online
            WHERE "profesorId" = NEW."profesorId"
              AND "diaSemana" = NEW."diaSemana"
              AND "horaInicio" = SUBSTRING(NEW."horaInicio"::varchar, 1, 5)
              AND "horaFin" = SUBSTRING(NEW."horaFin"::varchar, 1, 5)
              AND fecha::text = COALESCE(NEW.fecha::text, '1970-01-01');

            -- Si no existe, crear la clase online
            IF v_clase_existente IS NULL THEN
              -- Determinar tema basado en día
              v_tema_numero := CASE
                WHEN NEW."diaSemana" = 'lunes' THEN 1
                WHEN NEW."diaSemana" = 'martes' THEN 2
                WHEN NEW."diaSemana" = 'miércoles' THEN 3
                WHEN NEW."diaSemana" = 'jueves' THEN 4
                WHEN NEW."diaSemana" = 'viernes' THEN 5
                ELSE 1
              END;

              v_tema_nombre := CASE
                WHEN v_tema_numero = 1 THEN 'Señalización y Leyes de Tránsito'
                WHEN v_tema_numero = 2 THEN 'Límites de Velocidad y Distancias'
                WHEN v_tema_numero = 3 THEN 'Seguridad Vial Crítica y Sustancias'
                WHEN v_tema_numero = 4 THEN 'Mecánica Básica y Funcionamiento'
                WHEN v_tema_numero = 5 THEN 'Conducción en Condiciones Adversas'
                ELSE 'Tema'
              END;

              -- Convertir fecha a string YYYY-MM-DD
              IF NEW.fecha IS NOT NULL THEN
                v_year := EXTRACT(YEAR FROM NEW.fecha);
                v_month := LPAD(EXTRACT(MONTH FROM NEW.fecha)::text, 2, '0');
                v_day := LPAD(EXTRACT(DAY FROM NEW.fecha)::text, 2, '0');
                v_fecha_str := v_year || '-' || v_month || '-' || v_day;
              ELSE
                v_fecha_str := '1970-01-01';
              END IF;

              INSERT INTO clases_online (
                "profesorId", "numeroTema", "nombreTema", "diaSemana", fecha,
                "horaInicio", "horaFin", "capacidadMaxima", "alumnosAgendados",
                estado, "createdAt", "updatedAt"
              ) VALUES (
                NEW."profesorId", v_tema_numero, v_tema_nombre,
                NEW."diaSemana", v_fecha_str::date,
                SUBSTRING(NEW."horaInicio"::varchar, 1, 5), SUBSTRING(NEW."horaFin"::varchar, 1, 5),
                30, 0, 'activa', NOW(), NOW()
              );
            END IF;

          -- Si disponible cambió a FALSE: eliminar clase online
          ELSIF NEW.disponible = false AND OLD.disponible = true THEN
            DELETE FROM clases_online
            WHERE "profesorId" = NEW."profesorId"
              AND "diaSemana" = NEW."diaSemana"
              AND "horaInicio" = SUBSTRING(NEW."horaInicio"::varchar, 1, 5)
              AND "horaFin" = SUBSTRING(NEW."horaFin"::varchar, 1, 5)
              AND fecha::text = COALESCE(NEW.fecha::text, '1970-01-01');
          END IF;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Crear trigger
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS trigger_sync_clase_online ON disponibilidades;

      CREATE TRIGGER trigger_sync_clase_online
      AFTER UPDATE ON disponibilidades
      FOR EACH ROW
      EXECUTE FUNCTION sync_clase_online_with_disponibilidad();
    `;

    try {
      await queryRunner.query(createFunctionSQL);
      console.log("✅ Función sync_clase_online_with_disponibilidad creada");
    } catch (funcError) {
      console.log("⚠️ Función ya existe o error:", funcError.message.substring(0, 50));
    }

    try {
      await queryRunner.query(createTriggerSQL);
      console.log("✅ Trigger trigger_sync_clase_online creado");
    } catch (triggerError) {
      console.log("⚠️ Trigger ya existe o error:", triggerError.message.substring(0, 50));
    }

    await queryRunner.release();
    console.log("✅ Triggers inicializados correctamente");

  } catch (error) {
    console.error("❌ Error inicializando triggers:", error);
  }
};
