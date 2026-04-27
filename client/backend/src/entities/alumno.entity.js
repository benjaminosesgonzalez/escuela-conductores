import { EntitySchema } from "typeorm";

export const Alumno = new EntitySchema({
  name: "Alumno",
  tableName: "Alumnos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    name: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    rut: {
      type: "varchar",
      length: 12,
      unique: true,
    },
    phone: {
      type: "varchar",
      length: 15,
    },
    userId: {
      type: "int",
    },
    planId: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: { name: "userId" },
      onDelete: "CASCADE",
    },
    plan: {
      type: "many-to-one",
      target: "Plan",
      joinColumn: { name: "planId" },
    },
  },
});
