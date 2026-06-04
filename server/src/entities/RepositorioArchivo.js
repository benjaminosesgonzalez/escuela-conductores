import { EntitySchema } from "typeorm";

export const RepositorioArchivo = new EntitySchema({
  name: "RepositorioArchivo",
  tableName: "repositorio_archivos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    nombreOriginal: {
      type: "varchar",
      length: 255
    },
    nombreArchivo: {
      type: "varchar",
      length: 255
    },
    tipoArchivo: {
      type: "varchar",
      length: 100
    },
    rutaArchivo: {
      type: "varchar",
      length: 500
    },
    fechaSubida: {
      type: "timestamp",
      createDate: true
    }
  }
});