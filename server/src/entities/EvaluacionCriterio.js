import { EntitySchema } from "typeorm";

export const EvaluacionCriterio = new EntitySchema({
  name: "EvaluacionCriterio",
  tableName: "evaluacion_criterios",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    evaluacion_practica_id: {
      type: "int",
      nullable: false,
    },
    criterio_evaluacion_id: {
      type: "int",
      nullable: false,
    },
    orden: {
      type: "int",
      nullable: false,
    },
    created_at: {
      type: "timestamp",
      createDateColumn: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  indices: [
    {
      columns: ["evaluacion_practica_id"],
    },
    {
      columns: ["criterio_evaluacion_id"],
    },
  ],
});
