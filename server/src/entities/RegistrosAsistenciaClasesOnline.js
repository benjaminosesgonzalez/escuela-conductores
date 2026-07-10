import { EntitySchema } from "typeorm";

export const RegistrosAsistenciaClasesOnlineSchema = new EntitySchema({
  name: "RegistrosAsistenciaClasesOnline",
  tableName: "registros_asistencia_clases_online",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    claseOnlineId: {
      type: "int",
      nullable: false,
    },
    alumnoId: {
      type: "int",
      nullable: false,
    },
    asistio: {
      type: "boolean",
      default: false,
    },
    fechaRegistro: {
      type: "timestamp",
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
      name: "idx_asistencia_clase_alumno",
      columns: ["claseOnlineId", "alumnoId"],
      unique: true,
    },
  ],
});
