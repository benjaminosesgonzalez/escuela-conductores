import { AppDataSource } from "../config/configDb.js";
import { HorarioSala } from "../entities/horario_psicotecnico.entity.js";
import { ReservaPsicotecnico } from "../entities/reserva_psicotecnico.entity.js";

//auxiliares para manejar el tiempo en minutos
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
};

const minutesToTimeStr = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:00`;
};

export async function configurarHorarioSalaService(datosHorario) {
    const horarioRepository = AppDataSource.getRepository(HorarioSala);
    const { dia_semana, hora_inicio, hora_fin } = datosHorario;

    //eliminar configuracion previa a ese dia para evitar solapamientos
    await horarioRepository.delete({ dia_semana });

    const nuevoHorario = horarioRepository.create({
        dia_semana,
        hora_inicio,
        hora_fin,
    });

    return await horarioRepository.save(nuevoHorario);
}

export async function obtenerDisponibilidadSalaService(fechaStr) {
    const horarioRepository = AppDataSource.getRepository(HorarioSala);
    const reservaRepository = AppDataSource.getRepository(ReservaPsicotecnico);

    //1. Determinar el dia de la semana (0-6) a partir de la fecha
    const fecha = new Date(fechaStr + 'T00:00:00'); // Convertir a objeto Date
    const diaSemana = fecha.getDay();

    //2. Obtener reglas de apertura configurado para ese dia
    const reglasConfig = await horarioRepository.createQueryBuilder("horario")
    .where("horario.dia_semana = :dia", { dia: diaSemana })
    .andWhere("horario.activo = :activo", { activo: true })
    .getOne();

    if (!reglasConfig) return []; // Si no hay regla o está inactivo, retorna vacío (sala cerrada)
    
    //3. obtener reservas ya existentes para esa fecha
    const reservasExistentes = await reservaRepository.createQueryBuilder("reserva")
    .where("reserva.fecha = :fecha", { fecha: fechaStr })
    .andWhere("reserva.estado = :estado", { estado: 'agendada' })
    .getMany();

    //4. fragmentar el rango en bloques de 15mins
    const inicioMinutos = timeToMinutes(reglasConfig.hora_inicio);
    const finMinutos = timeToMinutes(reglasConfig.hora_fin);
    const bloques = [];

    for (let min = inicioMinutos; min + 15 <= finMinutos; min += 15) {
        const bloqueInicio = minutesToTimeStr(min);
        const bloqueFin = minutesToTimeStr(min + 15);

        //verificar si el bloque ya esta reservado
        const estaReservado = reservasExistentes.some(reserva => 
            reserva.hora_inicio === bloqueInicio ||
            (timeToMinutes(reserva.hora_inicio) < min + 15 && timeToMinutes(reserva.hora_fin) > min)
        );

        bloques.push({
            hora_inicio: bloqueInicio.substring(0,5), // "HH:MM"
            hora_fin: bloqueFin.substring(0,5),
            disponible: !estaReservado
        });
    }

    return bloques;
}

export async function agendarBloqueService(idAlumno, fechaStr, horaInicio){
    const reservaRepository = AppDataSource.getRepository(ReservaPsicotecnico);
    const alumnoRepository = AppDataSource.getRepository("Alumno");

    // Verificar que el alumno exista
    const perfilAlumno = await alumnoRepository.findOne({ where: { id_user: idAlumno } });
    if (!perfilAlumno) {
        throw new Error("Alumno no encontrado");
    }

    const idUser = perfilAlumno.id; // Obtener el ID del alumno a partir del perfil

    // calcular hora fin sumando 15 mins a hora inicio
    const minInicio = timeToMinutes(horaInicio);
    const horaFin = minutesToTimeStr(minInicio + 15);
    const horaInicioFormateada = minutesToTimeStr(minInicio);

    //Maximo 2 reservas por alumno por dia
    const reservasDelDia = await reservaRepository.count({ where: { id_alumno: idUser, fecha: fechaStr, estado: 'agendada' } });

    if (reservasDelDia >= 2) {
        throw new Error("No puedes agendar más de 2 bloques psicotécnicos por día.");
    }

    const nuevaReserva = reservaRepository.create({
        id_alumno: idUser,
        fecha: fechaStr,
        hora_inicio: horaInicioFormateada,
        hora_fin: horaFin,
        estado: 'agendada'
    });

    return await reservaRepository.save(nuevaReserva);
}
