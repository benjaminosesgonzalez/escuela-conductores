-- Drop old disponibilidades table and related objects

-- Drop the trigger first
DROP TRIGGER IF EXISTS trigger_sync_clase_online ON disponibilidades;

-- Drop the function
DROP FUNCTION IF EXISTS sync_clase_online_with_disponibilidad();

-- Drop the table
DROP TABLE IF EXISTS disponibilidades;
