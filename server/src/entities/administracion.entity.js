import { EntitySchema } from "typeorm";

export const Administracion = new EntitySchema({
  name: "Administracion",
  tableName: "administracion",
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
