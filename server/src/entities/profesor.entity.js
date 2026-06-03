import { EntitySchema } from "typeorm";

export const Profesor = new EntitySchema({
  name: "Profesor",
  tableName: "profesores",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    nombre: {
      type: "varchar",
      length: 100,
    },
    telefono: {
      type: "varchar",
      length: 15,
    },
    id_user: {
      type: "int",
    },
  },
  relations: {
    user: {
      target: "User",
      type: "one-to-one",
      joinColumn: { name: "id_user" },
      onDelete: "CASCADE",
    },
    sedes: {
      target: "Sede",
      type: "many-to-many",
      joinTable: {
        name: "profesor_sedes", // Tabla intermedia: id_profesor | id_sede
        joinColumn: { name: "id_profesor", referencedColumnName: "id" },
        inverseJoinColumn: { name: "id_sede", referencedColumnName: "id" },
      },
      cascade: true,
    },
  },
});
