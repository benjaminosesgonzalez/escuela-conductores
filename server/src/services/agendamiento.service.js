import { AppDataSource } from "../config/configDb.js";
import { HorarioSala } from "../entities/horario_psicotecnico.entity.js";
import { ReservaPsicotecnico } from "../entities/reserva_psicotecnico.entity.js";

//auxiliares para manejar el tiempo en minutos
const timeToMinutes = (timeVal) => {
    if (!timeVal) return 0;
    // Forzamos a que sea un string seguro por si TypeORM devuelve un objeto
    const timeStr = String(timeVal); 
    const parts = timeStr.split(":");
    if (parts.length < 2) return 0; // Fallback de seguridad
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
};

const minutesToTimeStr = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:00`;
};

export async function configurarHorarioSalaService(datosHorario) {
    const horarioRepository = AppDataSource.getRepository(HorarioSala);
    const { fecha, hora_inicio, hora_fin } = datosHorario;

    // 1. Siempre eliminamos la configuración previa de ESA FECHA EXACTA
    await horarioRepository.delete({ fecha });

    // 2. Si el front envió horas vacías (deseleccionó todo el día), terminamos aquí. El día queda borrado.
    if (!hora_inicio || !hora_fin) return null;

    // 3. Si hay horas, creamos el nuevo registro
    const nuevoHorario = horarioRepository.create({
        fecha,
        dia_semana: new Date(fecha + 'T00:00:00').getDay(),
        hora_inicio,
        hora_fin,
        activo: true
    });

    return await horarioRepository.save(nuevoHorario);
}

export async function obtenerDisponibilidadSalaService(fechaStr) {
    const horarioRepository = AppDataSource.getRepository(HorarioSala);
    const reservaRepository = AppDataSource.getRepository(ReservaPsicotecnico);

    const reglasConfig = await horarioRepository.createQueryBuilder("horario")
    .where("horario.fecha = :fechaExacta", { fechaExacta: fechaStr })
    .andWhere("horario.activo = :activo", { activo: true })
    .getOne();

    // Si no hay configuración, o los datos vienen corruptos, retornamos vacío
    if (!reglasConfig || !reglasConfig.hora_inicio || !reglasConfig.hora_fin) return []; 
    
    const reservasExistentes = await reservaRepository.createQueryBuilder("reserva")
    .where("reserva.fecha = :fecha", { fecha: fechaStr })
    .andWhere("reserva.estado = :estado", { estado: 'agendada' })
    .getMany();

    const inicioMinutos = timeToMinutes(reglasConfig.hora_inicio);
    const finMinutos = timeToMinutes(reglasConfig.hora_fin);
    const bloques = [];

    for (let min = inicioMinutos; min + 15 <= finMinutos; min += 15) {
        const bloqueInicio = minutesToTimeStr(min);
        const bloqueFin = minutesToTimeStr(min + 15);

        const estaReservado = reservasExistentes.some(reserva => 
            reserva.hora_inicio === bloqueInicio ||
            (timeToMinutes(reserva.hora_inicio) < min + 15 && timeToMinutes(reserva.hora_fin) > min)
        );

        bloques.push({
            hora_inicio: bloqueInicio.substring(0,5),
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

export async function obtenerMisReservasPsicotecnicoService(idUsuario) {
    const reservaRepository = AppDataSource.getRepository(ReservaPsicotecnico);
    const alumnoRepository = AppDataSource.getRepository("Alumno");

    // 1. Buscar el perfil del alumno asociado a este usuario (token)
    const perfilAlumno = await alumnoRepository.findOne({ where: { id_user: idUsuario } });
    
    if (!perfilAlumno) {
        throw new Error("Alumno no encontrado");
    }

    // 2. Buscar todas las reservas de este alumno
    const reservas = await reservaRepository.createQueryBuilder("reserva")
        .where("reserva.id_alumno = :idAlumno", { idAlumno: perfilAlumno.id })
        .andWhere("reserva.estado = :estado", { estado: 'agendada' })
        .orderBy("reserva.fecha", "ASC")
        .addOrderBy("reserva.hora_inicio", "ASC")
        .getMany();

    // 3. Formatear la salida para el frontend (ej: "09:00" en vez de "09:00:00")
    return reservas.map(reserva => ({
        id: reserva.id,
        fecha: reserva.fecha,
        hora_inicio: reserva.hora_inicio.substring(0, 5),
        hora_fin: reserva.hora_fin.substring(0, 5),
        estado: reserva.estado
    }));
}