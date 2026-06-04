import{
    configurarHorarioSalaService,
    obtenerDisponibilidadSalaService,
    agendarBloqueService
} from "../services/agendamiento.service.js";

export async function configurarHorarioSala(req, res) {
    try {
        const { dia_semana, hora_inicio, hora_fin } = req.body;

        if (dia_semana === undefined || hora_inicio === undefined || hora_fin === undefined) {
            return res.status(400).json({ message: "Faltan campos requeridos: dia de la semana, hora de inicio y hora de fin" });
        }

        const configuracion = await configurarHorarioSalaService({ dia_semana, hora_inicio, hora_fin });
        res.status(200).json({ message: "Horario de sala configurado exitosamente", data: configuracion });
    } catch (error) {
        return res.status(500).json({ message: "Error al configurar el horario de la sala", error: error.message });
    }
}

export async function obtenerDisponibilidadSala(req, res) {
    try {
        const { fecha } = req.query;

        if (!fecha) {
            return res.status(400).json({ message: "El parámetro 'fecha' es requerido" });
        }

        const disponibilidad = await obtenerDisponibilidadSalaService(fecha);
        return res.status(200).json({
            message: "Disponibilidad de la sala obtenida exitosamente",
            data: disponibilidad
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener la disponibilidad de la sala", error: error.message });
    }
}

export async function agendarBloque(req, res) {
    try {
        const { fecha, hora_inicio } = req.body;
        const idAlumno = req.user.id; // Obtener el ID del alumno desde el token

        if (!fecha || !hora_inicio) {
            return res.status(400).json({ message: "Fecha y hora de inicio son requeridos" });
        }

        const reserva = await agendarBloqueService(idAlumno, fecha, hora_inicio);
        return res.status(201).json({ message: "Bloque agendado exitosamente", data: reserva });
    } catch (error) {
        if (error.message.includes('LÍMITE_EXCEDIDO') || error.message.includes('BLOQUE_OCUPADO')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Error al agendar el bloque", error: error.message });
    }
}
