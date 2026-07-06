import { EntitySchema } from "typeorm";

export const DisponibilidadAlumno = new EntitySchema({
  name: "DisponibilidadAlumno",
  tableName: "disponibilidades_alumnos",
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
    disponible: {
      type: "boolean",
      default: true,
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
  },
});
