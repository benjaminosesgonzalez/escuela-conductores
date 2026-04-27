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
  },
});
