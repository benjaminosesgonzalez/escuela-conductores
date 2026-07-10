import { EntitySchema } from "typeorm";

export const ClaseMaterial = new EntitySchema({
  name: "ClaseMaterial",
  tableName: "clase_material",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    claseId: {
      type: "int",
      nullable: false,
    },
    repositorioArchivoId: {
      type: "int",
      nullable: false,
    },
    createdAt: {
      type: "timestamp",
      createDateColumn: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  indices: [
    {
      columns: ["claseId"],
    },
    {
      columns: ["repositorioArchivoId"],
    },
  ],
  relations: {
    clase: {
      type: "many-to-one",
      target: "clases_online",
      joinColumn: {
        name: "claseId",
        referencedColumnName: "id",
      },
    },
    archivo: {
      type: "many-to-one",
      target: "RepositorioArchivo",
      joinColumn: {
        name: "repositorioArchivoId",
        referencedColumnName: "id",
      },
    },
  },
});
