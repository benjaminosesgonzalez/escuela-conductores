import { EntitySchema } from 'typeorm';

export const HorarioSala = new EntitySchema({
  name: 'HorarioSala',
  tableName: 'horario_sala',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    dia_semana: {
      type: 'int', // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
      nullable: false
    },
    hora_inicio: {
      type: 'time', // Ej: "09:00:00"
      nullable: false
    },
    hora_fin: {
      type: 'time', // Ej: "20:00:00"
      nullable: false
    },
    activo: {
      type: 'boolean',
      default: true
    },
    fecha: {
      type: 'date',
      nullable: false,
    }
  }
});