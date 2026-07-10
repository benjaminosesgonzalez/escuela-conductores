import { EntitySchema } from "typeorm";

export const AvancesTemasSchema = new EntitySchema({
  name: "AvancesTemas",
  tableName: "avances_temas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    id_alumno: {
      type: "int",
      nullable: false,
    },
    id_tema: {
      type: "int",
      nullable: false,
    },
    completado: {
      type: "boolean",
      default: false,
    },
    fecha_completado: {
      type: "timestamp",
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    alumno: {
      target: "Alumno",
      type: "many-to-one",
      joinColumn: { name: "id_alumno" },
      onDelete: "CASCADE",
    },
  },
  indices: [
    {
      name: "idx_avances_alumno_tema",
      columns: ["id_alumno", "id_tema"],
      unique: true,
    },
  ],
});
