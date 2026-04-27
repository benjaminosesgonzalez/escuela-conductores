import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User", // Este es el nombre clave
  tableName: "users",
  columns: {
    id: { primary: true, type: "int", generated: "increment" },
    email: { type: "varchar", length: 255, unique: true, nullable: false },
    password: { type: "varchar", length: 255, nullable: false },
    rol: {
      type: "varchar",
      length: 50,
      default: "alumno",
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
  relations: {
    // Apuntamos a los nuevos nombres en español
    alumno: {
      type: "one-to-one",
      target: "Alumno", // Debe coincidir con name: "Alumno" en su respectivo archivo
      mappedBy: "user",
    },
    profesor: {
      type: "one-to-one",
      target: "Profesor",
      mappedBy: "user",
    },
    administracion: {
      type: "one-to-one",
      target: "Administracion",
      mappedBy: "user",
    },
  },
});
