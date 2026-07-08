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
    nombre: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    rut: {
      type: "varchar",
      length: 12,
      unique: true,
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
  relations: {
    user: {
      target: "User",
      type: "one-to-one",
      joinColumn: {
        name: "id_user",
      },
      onDelete: "CASCADE",
    },
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