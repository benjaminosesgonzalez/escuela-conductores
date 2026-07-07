import { EntitySchema } from "typeorm";

export const ClaseOnlineSchema = new EntitySchema({
  name: "ClaseOnline",
  tableName: "clases_online",
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
    numeroTema: {
      type: "int",
      nullable: false, // 1-10
    },
    nombreTema: {
      type: "varchar",
      length: 255,
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
    capacidadMaxima: {
      type: "int",
      default: 30,
    },
    alumnosAgendados: {
      type: "int",
      default: 0,
    },
    linkZoom: {
      type: "varchar",
      length: 500,
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 20,
      default: "activa", // activa, completada, cancelada
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
