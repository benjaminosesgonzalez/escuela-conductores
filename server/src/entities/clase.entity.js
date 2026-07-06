import { EntitySchema } from "typeorm";

export const Clase = new EntitySchema({
  name: "Clase",
  tableName: "clases",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    alumnoId: {
      type: "int",
      nullable: false,
    },
    profesorId: {
      type: "int",
      nullable: false,
    },
    diaSemana: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    horaInicio: {
      type: "varchar",
      length: 5,
      nullable: false,
    },
    horaFin: {
      type: "varchar",
      length: 5,
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 20,
      default: "confirmada", // confirmada, completada, cancelada
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    alumno: {
      target: "Alumno",
      type: "many-to-one",
      joinColumn: { name: "alumnoId" },
      onDelete: "CASCADE",
    },
    profesor: {
      target: "Profesor",
      type: "many-to-one",
      joinColumn: { name: "profesorId" },
      onDelete: "CASCADE",
    },
  },
});
