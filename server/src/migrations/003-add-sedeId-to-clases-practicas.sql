-- Agregar columna sedeId a clases_practicas
ALTER TABLE clases_practicas
ADD COLUMN "sedeId" INT,
ADD CONSTRAINT fk_clases_practicas_sede
FOREIGN KEY ("sedeId") REFERENCES sedes(id) ON DELETE SET NULL;

-- Crear índice para búsquedas por sedeId
CREATE INDEX idx_clases_practicas_sedeId ON clases_practicas("sedeId");
