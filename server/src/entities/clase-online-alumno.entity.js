import { EntitySchema } from "typeorm";

export const ClaseOnlineAlumnoSchema = new EntitySchema({
  name: "ClaseOnlineAlumno",
  tableName: "clase_online_alumno",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    claseOnlineId: {
      type: "int",
      nullable: false,
    },
    alumnoId: {
      type: "int",
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 20,
      default: "inscrito", // inscrito, asistio, ausente
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
    claseOnline: {
      target: "ClaseOnline",
      type: "many-to-one",
      joinColumn: { name: "claseOnlineId" },
      onDelete: "CASCADE",
    },
    alumno: {
      target: "Alumno",
      type: "many-to-one",
      joinColumn: { name: "alumnoId" },
      onDelete: "CASCADE",
    },
  },
  indices: [
    {
      name: "idx_clase_alumno_unique",
      columns: ["claseOnlineId", "alumnoId"],
      unique: true,
    },
  ],
});
