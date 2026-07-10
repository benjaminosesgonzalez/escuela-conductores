import { EntitySchema } from "typeorm";

export const CriterioEvaluacionPractica = new EntitySchema({
  name: "CriterioEvaluacionPractica",
  tableName: "criterios_evaluacion_practica",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    tipo_falta: {
      type: "enum",
      enum: ["baja", "media", "alta"],
      nullable: false,
    },
    puntaje_descuento: {
      type: "decimal",
      precision: 3,
      scale: 1,
      nullable: false,
    },
    orden: {
      type: "int",
      nullable: false,
    },
    activo: {
      type: "boolean",
      default: true,
    },
    created_at: {
      type: "timestamp",
      createDateColumn: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});
