import { EntitySchema } from "typeorm";

export const DisponibilidadSchema = new EntitySchema({
  name: "Disponibilidad",
  tableName: "disponibilidades_profesores",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    profesorId: {
      type: "int",
      nullable: false,
    },
    diaSemana: {
      type: "varchar",
      length: 20, // 'lunes', 'martes', 'miércoles', 'jueves', 'viernes'
      nullable: false,
    },
    fecha: {
      type: "date",
      nullable: true,
    },
    horaInicio: {
      type: "time",
      nullable: false,
    },
    horaFin: {
      type: "time",
      nullable: false,
    },
    disponible: {
      type: "boolean",
      default: true,
      nullable: false,
    },
    tipoDisponibilidad: {
      type: "varchar",
      length: 20,
      enum: ["teorica", "practica"],
      default: "teorica",
      nullable: false,
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
  },
});
