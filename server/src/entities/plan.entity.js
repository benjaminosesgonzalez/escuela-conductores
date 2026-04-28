import { EntitySchema } from "typeorm";

export const Plan = new EntitySchema({
  name: "Plan",
  tableName: "plans",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    name: {
      type: "varchar",
      length: 50,
      nullable: false, // Ej: "Plan básico", "Plan intermedio", "Plan intensivo"
    },
    price: {
      type: "int",
      nullable: false, // Ej: 50000, 90000, 130000
    },
    total_classes: {
      type: "int",
      nullable: false, // Ej: 4, 8, 12
    },
    theoretical_level: {
      type: "varchar",
      length: 50,
      nullable: false, // Ej: "Curso teórico básico", "intermedio", "avanzado"
    },
    simulator_classes: {
      type: "int",
      nullable: false,
      default: 0, // Ej: 1, 2, 3
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});
