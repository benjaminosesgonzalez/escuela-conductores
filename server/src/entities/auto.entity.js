import { EntitySchema } from "typeorm";

export const Auto = new EntitySchema({
  name: "Auto",
  tableName: "autos",
  columns: {
    id: { primary: true, type: "int", generated: "increment" },
    patente: { type: "varchar", length: 10, unique: true },
    marca: { type: "varchar", length: 50 },
    modelo: { type: "varchar", length: 50 },
    anio: { type: "int" },
    estado: {
      type: "enum",
      enum: ["disponible", "en_uso", "mantenimiento"],
      default: "disponible",
    },
  },
  relations: {
    sede: {
      target: "Sede",
      type: "many-to-one",
      joinColumn: { name: "id_sede" },
      onDelete: "SET NULL", // Si se borra la sede, el auto queda sin sede pero no se borra
    },
  },
});
