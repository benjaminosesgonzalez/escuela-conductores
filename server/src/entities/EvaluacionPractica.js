import { EntitySchema } from "typeorm";

export const EvaluacionPractica = new EntitySchema({
  name: "EvaluacionPractica",
  tableName: "evaluaciones_practicas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    clase_practica_id: {
      type: "int",
      nullable: false,
    },
    profesor_id: {
      type: "int",
      nullable: false,
    },
    alumno_id: {
      type: "int",
      nullable: false,
    },
    fecha: {
      type: "date",
      nullable: false,
    },
    hora: {
      type: "varchar",
      length: 5,
      nullable: false,
    },
    nota_inicial: {
      type: "decimal",
      precision: 3,
      scale: 1,
      default: 7.0,
    },
    nota_final: {
      type: "decimal",
      precision: 3,
      scale: 1,
      nullable: true,
    },
    aprobado: {
      type: "boolean",
      nullable: true,
    },
    estado: {
      type: "enum",
      enum: ["en_proceso", "completada"],
      default: "en_proceso",
    },
    falta_grave_detectada: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDateColumn: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: "timestamp",
      updateDateColumn: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  indices: [
    {
      columns: ["clase_practica_id"],
    },
    {
      columns: ["profesor_id"],
    },
    {
      columns: ["alumno_id"],
    },
  ],
});
