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
        v_lunes_actual DATE;
        v_lunes_semana1 DATE;
        v_numero_semana INTEGER;
        v_hoy DATE;
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
              -- Calcular número de semana basado en fecha
              v_hoy := CURRENT_DATE;
              v_lunes_actual := v_hoy - (EXTRACT(DOW FROM v_hoy)::integer + 6) % 7;
              v_lunes_semana1 := v_lunes_actual + 7;

              v_numero_semana := 0;
              IF COALESCE(NEW.fecha, v_hoy) >= v_lunes_semana1 THEN
                v_numero_semana := 1;
              END IF;

              -- Determinar tema basado en semana y día (mismo cálculo que en el servicio)
              v_tema_numero := CASE
                WHEN v_numero_semana = 0 THEN
                  CASE
                    WHEN NEW."diaSemana" = 'lunes' THEN 1
                    WHEN NEW."diaSemana" = 'martes' THEN 2
                    WHEN NEW."diaSemana" = 'miércoles' THEN 3
                    WHEN NEW."diaSemana" = 'jueves' THEN 4
                    WHEN NEW."diaSemana" = 'viernes' THEN 5
                    ELSE 1
                  END
                ELSE
                  CASE
                    WHEN NEW."diaSemana" = 'lunes' THEN 6
                    WHEN NEW."diaSemana" = 'martes' THEN 7
                    WHEN NEW."diaSemana" = 'miércoles' THEN 8
                    WHEN NEW."diaSemana" = 'jueves' THEN 9
                    WHEN NEW."diaSemana" = 'viernes' THEN 10
                    ELSE 6
                  END
              END;

              v_tema_nombre := CASE
                WHEN v_tema_numero = 1 THEN 'Señalización y Leyes de Tránsito'
                WHEN v_tema_numero = 2 THEN 'Límites de Velocidad y Distancias'
                WHEN v_tema_numero = 3 THEN 'Seguridad Vial Crítica y Sustancias'
                WHEN v_tema_numero = 4 THEN 'Mecánica Básica y Funcionamiento'
                WHEN v_tema_numero = 5 THEN 'Conducción en Condiciones Adversas'
                WHEN v_tema_numero = 6 THEN 'Conducción Eficiente'
                WHEN v_tema_numero = 7 THEN 'Siniestros y Sistema Seguro'
                WHEN v_tema_numero = 8 THEN 'Psicología del Conductor y Atención'
                WHEN v_tema_numero = 9 THEN 'Elementos de Seguridad Activa y Pasiva'
                WHEN v_tema_numero = 10 THEN 'Convivencia Vial y Educación Vial'
                ELSE 'Tema'
              END;

              -- Insertar clase online (usar fecha directamente, puede ser NULL)
              INSERT INTO clases_online (
                "profesorId", "numeroTema", "nombreTema", "diaSemana", fecha,
                "horaInicio", "horaFin", "capacidadMaxima", "alumnosAgendados",
                estado, "createdAt", "updatedAt"
              ) VALUES (
                NEW."profesorId", v_tema_numero, v_tema_nombre,
                NEW."diaSemana", NEW.fecha,
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
