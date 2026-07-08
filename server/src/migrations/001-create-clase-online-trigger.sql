-- Trigger para sincronizar clases online cuando cambia disponibilidad

-- Crear función que maneja la sincronización de clases online
CREATE OR REPLACE FUNCTION sync_clase_online_with_disponibilidad()
RETURNS TRIGGER AS $$
DECLARE
  v_clase_existente INTEGER;
  v_nueva_clase_id INTEGER;
  v_tema RECORD;
  v_numero_semana INTEGER;
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
        AND "horaInicio" = SUBSTRING(NEW."horaInicio", 1, 5)
        AND "horaFin" = SUBSTRING(NEW."horaFin", 1, 5)
        AND fecha = COALESCE(NEW.fecha, '1970-01-01');

      -- Si no existe, crear la clase online
      IF v_clase_existente IS NULL THEN
        -- Obtener tema basado en la semana
        SELECT numero, nombre INTO v_tema.numero, v_tema.nombre
        FROM (
          SELECT 1 as numero, 'Señalización y Leyes de Tránsito' as nombre
          UNION ALL SELECT 2, 'Límites de Velocidad y Distancias'
          UNION ALL SELECT 3, 'Seguridad Vial Crítica y Sustancias'
          UNION ALL SELECT 4, 'Mecánica Básica y Funcionamiento'
          UNION ALL SELECT 5, 'Conducción en Condiciones Adversas'
          UNION ALL SELECT 6, 'Conducción Eficiente'
          UNION ALL SELECT 7, 'Siniestros y Sistema Seguro'
          UNION ALL SELECT 8, 'Psicología del Conductor y Atención'
          UNION ALL SELECT 9, 'Elementos de Seguridad Activa y Pasiva'
          UNION ALL SELECT 10, 'Convivencia Vial y Educación Vial'
        ) AS temas
        WHERE numero = CASE
          WHEN NEW."diaSemana" = 'lunes' THEN 1
          WHEN NEW."diaSemana" = 'martes' THEN 2
          WHEN NEW."diaSemana" = 'miércoles' THEN 3
          WHEN NEW."diaSemana" = 'jueves' THEN 4
          WHEN NEW."diaSemana" = 'viernes' THEN 5
          ELSE 1
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
          NEW."profesorId", COALESCE(v_tema.numero, 1), COALESCE(v_tema.nombre, 'Tema'),
          NEW."diaSemana", v_fecha_str,
          SUBSTRING(NEW."horaInicio", 1, 5), SUBSTRING(NEW."horaFin", 1, 5),
          30, 0, 'activa', NOW(), NOW()
        );
      END IF;

    -- Si disponible cambió a FALSE: eliminar clase online
    ELSIF NEW.disponible = false AND OLD.disponible = true THEN
      DELETE FROM clases_online
      WHERE "profesorId" = NEW."profesorId"
        AND "diaSemana" = NEW."diaSemana"
        AND "horaInicio" = SUBSTRING(NEW."horaInicio", 1, 5)
        AND "horaFin" = SUBSTRING(NEW."horaFin", 1, 5)
        AND fecha = COALESCE(NEW.fecha, '1970-01-01');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_sync_clase_online ON disponibilidades;

CREATE TRIGGER trigger_sync_clase_online
AFTER UPDATE ON disponibilidades
FOR EACH ROW
EXECUTE FUNCTION sync_clase_online_with_disponibilidad();
