import {
  inscribirAlumnoEnClaseOnline,
  desinscribirAlumnoDeClaseOnline,
  obtenerClasesOnlineDisponibles,
  obtenerMisClasesOnlineAlumno,
  verificarInscripcion,
} from "../services/clase-online-alumno.service.js";

export const obtenerClasesDisponibles = async (req, res) => {
  try {
    const { semana = 0 } = req.query;
    const resultado = await obtenerClasesOnlineDisponibles(parseInt(semana));
    res.json(resultado);
  } catch (error) {
    console.error("Error en obtenerClasesDisponibles:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const inscribirse = async (req, res) => {
  try {
    const { claseOnlineId } = req.params;
    const alumnoId = req.user.id;

    const resultado = await inscribirAlumnoEnClaseOnline(
      parseInt(claseOnlineId),
      alumnoId
    );

    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    console.error("Error en inscribirse:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const desinscribirse = async (req, res) => {
  try {
    const { claseOnlineId } = req.params;
    const alumnoId = req.user.id;

    const resultado = await desinscribirAlumnoDeClaseOnline(
      parseInt(claseOnlineId),
      alumnoId
    );

    if (resultado.success) {
      res.json(resultado);
    } else {
      res.status(400).json(resultado);
    }
  } catch (error) {
    console.error("Error en desinscribirse:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const obtenerMisClases = async (req, res) => {
  try {
    const alumnoId = req.user.id;
    const resultado = await obtenerMisClasesOnlineAlumno(alumnoId);
    res.json(resultado);
  } catch (error) {
    console.error("Error en obtenerMisClases:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verificarMiInscripcion = async (req, res) => {
  try {
    const { claseOnlineId } = req.params;
    const alumnoId = req.user.id;

    const estaInscrito = await verificarInscripcion(
      parseInt(claseOnlineId),
      alumnoId
    );

    res.json({ success: true, inscrito: estaInscrito });
  } catch (error) {
    console.error("Error en verificarMiInscripcion:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
