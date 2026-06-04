import { EntitySchema } from "typeorm";

export const Secretaria = new EntitySchema({
  name: "Secretaria",
  tableName: "secretarias",
  columns: {
    id: { primary: true, type: "int", generated: "increment" },
    nombre: { type: "varchar", length: 100 },
    telefono: {
      type: "varchar",
      length: 12,
      nullable: true,
    },
    id_user: { type: "int" },
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
