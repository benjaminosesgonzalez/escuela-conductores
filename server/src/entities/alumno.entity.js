import { EntitySchema } from "typeorm";

export const Alumno = new EntitySchema({
  name: "Alumno",
  tableName: "alumnos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    nombre: {
      type: "varchar",
      length: 150,
      nullable: false,
    },
    rut: {
      type: "varchar",
      length: 12,
      unique: true,
    },
    telefono: {
      type: "varchar",
      length: 15,
    },
    sexo: {
      type: "varchar",
      length: 20,
      unique: false
    },
    comuna: {
      type: "varchar",
      length: 50,
      nullable: true
    },
    id_user: {
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
    id_sede: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: { name: "id_user" },
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
    sede: {
      target: "Sede",
      type: "many-to-one",
      joinColumn: { name: "id_sede" },
      onDelete: "SET NULL",
    },
  },
});
