import { EntitySchema } from "typeorm";

export const ReservaPsicotecnico = new EntitySchema({
    name: "ReservaPsicotecnico",
    tableName: "reserva_psicotecnico",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        id_alumno: {
            type: "int",
            nullable: false,
        },
        fecha: {
            type: "date",
            nullable: false,
        },
        hora_inicio: {
            type: "time",
            nullable: false,
        },
        hora_fin: {
            type: "time",
            nullable: false,
        },
        estado: {
            type: "varchar",
            default: "agendada",
        },
        created_at: {
            type: "timestamp",
            createDate: true,
        }
    },
    relations: {
        alumno: {
            target: "Alumno",
            type: "many-to-one",
            joinColumn: { name: "id_alumno" },
            onDelete: "CASCADE",
        },
    },
});