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
    id_plan_interes: {
      type: "int",
      nullable: true,
    },

    id_plan_matriculado: {
      type: "int",
      nullable: true,
    },
    estado_matricula: {
      type: "varchar",
      length: 20,
      default: "pendiente", // "pendiente", "matriculado", "finalizado"
    },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: { name: "userId" },
      onDelete: "CASCADE",
    },
    planInteres: {
      target: "Plan",
      type: "many-to-one",
      joinColumn: { name: "id_plan_interes" },
    },
    planMatriculado: {
      target: "Plan",
      type: "many-to-one",
      joinColumn: { name: "id_plan_matriculado" },
    },
  },
});
