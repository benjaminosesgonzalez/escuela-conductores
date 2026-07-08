import { EntitySchema } from "typeorm";

export const SolicitudAuto = new EntitySchema({
  name: "SolicitudAuto",
  tableName: "solicitudes_autos",
  columns: {
    id: { primary: true, type: "int", generated: "increment" },
    fecha_uso: { type: "date" }, // El día que se necesita
    hora_uso: { type: "time" }, // La hora específica
    detalles: { type: "text", nullable: true }, // Campo opcional
    estado: {
      type: "enum",
      enum: ["pendiente", "aceptado", "rechazado"],
      default: "pendiente",
    },
    hora_termino: { type: "time" },
    tipo_solicitante: {
      type: "enum",
      enum: ["profesor", "alumno"],
    },
    fecha_creacion: { type: "timestamp", createDate: true },
  },
  relations: {
    user: {
      // El usuario (profe o alumno) que hace la solicitud
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "id_user" },
    },
    sede: {
      // Importante para que la secretaria filtre por sede
      target: "Sede",
      type: "many-to-one",
      joinColumn: { name: "id_sede" },
    },
    // NUEVA RELACIÓN AGREGADA AQUÍ
    auto: {
      // El vehículo físico asignado a la solicitud
      target: "Auto",
      type: "many-to-one",
      joinColumn: { name: "id_auto" },
      nullable: true, // Es fundamental que sea true, porque la solicitud nace sin auto asignado
    },
  },
});
