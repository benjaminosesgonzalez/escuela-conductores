import { EntitySchema } from "typeorm";

export const Sede = new EntitySchema({
  name: "Sede",
  tableName: "sedes",
  columns: {
    id: { primary: true, type: "int", generated: "increment" },
    nombre: { type: "varchar", length: 100, unique: true },
    direccion: { type: "varchar", length: 255 },
    comuna: { type: "varchar", length: 100, nullable: true },
  },
  relations: {
    profesores: {
      target: "Profesor",
      type: "many-to-many",
      mappedBy: "sedes", // Nombre del campo en la entidad Profesor
    },
  },
});
