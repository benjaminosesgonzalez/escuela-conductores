import { EntitySchema } from "typeorm";

export const ClasePracticaSchema = new EntitySchema({
  name: "ClasePractica",
  tableName: "clases_practicas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
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
    fecha: {
      type: "date",
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
    alumnoId: {
      type: "int",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 20,
      default: "disponible", // disponible, ocupada, completada, cancelada
      nullable: false,
    },
    sedeId: {
      type: "int",
      nullable: true,
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
    profesor: {
      target: "Profesor",
      type: "many-to-one",
      joinColumn: { name: "profesorId" },
      onDelete: "CASCADE",
    },
    alumno: {
      target: "Alumno",
      type: "many-to-one",
      joinColumn: { name: "alumnoId" },
      onDelete: "SET NULL",
    },
    sede: {
      target: "Sede",
      type: "many-to-one",
      joinColumn: { name: "sedeId" },
      onDelete: "SET NULL",
    },
  },
});
