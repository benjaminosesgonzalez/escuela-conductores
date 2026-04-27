import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    email: {
      type: "varchar",
      length: 255,
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    rol: {
      type: "varchar",
      length: 50,
      default: "alumno", // "user", "admin", "secretaria", etc.
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
    relations: {
      alumnoProfile: {
        type: "one-to-one",
        target: "alumno",
        mappedBy: "user",
        cascade: true,
      },
      administracionProfile: {
        type: "one-to-one",
        target: "Administracion",
        mappedBy: "user",
        cascade: true,
      },
    },
  },
});
