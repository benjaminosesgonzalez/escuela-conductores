import { EntitySchema } from "typeorm";

export const ProfesorSchema = new EntitySchema({
  name: "Profesor",
  tableName: "profesores",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    email: {
      type: "varchar",
      length: 100,
      unique: true,
    },
    password: {
      type: "varchar",
      length: 255,
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    telefono: {
      type: "varchar",
      length: 15,
      nullable: true,
    },
    tipo_contrato: {
      type: "varchar",
      length: 20,
      default: "full_time",
      nullable: false,
    },
  },
});