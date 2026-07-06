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
     },

  relations: {
    sedes: {
      target: "Sede",
      type: "many-to-many",
      joinTable: {
        name: "profesor_sedes",
        joinColumn: {
          name: "id_profesor",
          referencedColumnName: "id",
        },
        inverseJoinColumn: {
          name: "id_sede",
          referencedColumnName: "id",
        },
      },
      cascade: true,
    },
  },
});