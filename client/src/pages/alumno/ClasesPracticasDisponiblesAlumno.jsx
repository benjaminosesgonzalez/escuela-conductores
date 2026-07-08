import React, { useState, useEffect } from "react";
import { authService } from "../../services/authService";
import "./ClasesOnlineDisponiblesAlumno.css";

const ClasesPracticasDisponiblesAlumno = ({ onDesinscripcion }) => {
  const [clases, setClases] = useState([]);
  const [semanaActual, setSemanaActual] = useState(0);
  const [inscripciones, setInscripciones] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [filtroProfesor, setFiltroProfesor] = useState("");

  useEffect(() => {
    cargarClasesDisponibles();
  }, [semanaActual]);

  const cargarClasesDisponibles = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/clases-online-alumno/disponibles?semana=${semanaActual}`,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setClases(data.clases);
        // Verificar inscripciones para cada clase
        verificarInscripciones(data.clases);
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al cargar las clases" });
    }
    setLoading(false);
  };

  const verificarInscripciones = async (clasesData) => {
    const inscritos = new Set();
    for (const clase of clasesData) {
      try {
        const response = await fetch(
          `/api/clases-online-alumno/${clase.id}/inscrito`,
          {
            headers: {
              Authorization: `Bearer ${authService.getToken()}`,
            },
          }
        );
        const data = await response.json();
        if (data.inscrito) {
          inscritos.add(clase.id);
        }
      } catch (error) {
        console.error("Error verificando inscripción:", error);
      }
    }
    setInscripciones(inscritos);
  };

  const inscribirse = async (claseId) => {
    try {
      const response = await fetch(
        `/api/clases-online-alumno/${claseId}/inscribirse`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMensaje({
          tipo: "exito",
          texto: "¡Inscripción completada exitosamente!",
        });
        setInscripciones(new Set([...inscripciones, claseId]));
        setTimeout(() => cargarClasesDisponibles(), 500);
      } else {
        setMensaje({ tipo: "error", texto: data.message });
      }
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: "Error al inscribirse en la clase",
      });
    }

    setTimeout(() => setMensaje(null), 3000);
  };

  const desinscribirse = async (claseId) => {
    try {
      const response = await fetch(
        `/api/clases-online-alumno/${claseId}/desinscribirse`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMensaje({ tipo: "exito", texto: "Desinscripción completada" });
        const nuevas = new Set(inscripciones);
        nuevas.delete(claseId);
        setInscripciones(nuevas);
        setTimeout(() => cargarClasesDisponibles(), 500);
        // Notificar al padre para refrescar "Mis clases"
        if (onDesinscripcion) {
          setTimeout(() => onDesinscripcion(), 600);
        }
      } else {
        setMensaje({ tipo: "error", texto: data.message });
      }
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: "Error al desinscribirse de la clase",
      });
    }

    setTimeout(() => setMensaje(null), 3000);
  };

  const claseFiltradas = clases.filter((c) => {
    const coincideProfesor = !filtroProfesor ||
      c.nombreProfesor?.toLowerCase().includes(filtroProfesor.toLowerCase());
    const coincideTipo = c.tipoDisponibilidad === 'practica';
    return coincideProfesor && coincideTipo;
  });

  const profesores = [...new Set(clases.map((c) => c.nombreProfesor))];

  const obtenerFechaFormato = (fechaStr) => {
    try {
      // Parsear la fecha string "YYYY-MM-DD"
      const [year, month, day] = fechaStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return "Fecha inválida";
    }
  };

  return (
    <div className="clases-online-disponibles-container">
      <div className="header-clases">
        <h2>🚗 Reservar Clase Práctica</h2>
        <div className="controles-semana">
          <button
            onClick={() => setSemanaActual(Math.max(0, semanaActual - 1))}
            disabled={semanaActual === 0}
            className="btn-semana"
          >
            ← Semana Anterior
          </button>
          <span className="semana-label">
            Semana {semanaActual === 0 ? "Actual" : `+${semanaActual}`}
          </span>
          <button
            onClick={() => setSemanaActual(semanaActual + 1)}
            className="btn-semana"
          >
            Próxima Semana →
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`mensaje mensaje-${mensaje.tipo}`}>{mensaje.texto}</div>
      )}

      <div className="filtros-clases">
        <select
          value={filtroProfesor}
          onChange={(e) => setFiltroProfesor(e.target.value)}
          className="select-filtro"
        >
          <option value="">Todos los Profesores</option>
          {profesores.map((prof) => (
            <option key={prof} value={prof}>
              {prof}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="cargando">Cargando clases...</div>
      ) : claseFiltradas.length === 0 ? (
        <div className="sin-clases">No hay clases disponibles en esta semana</div>
      ) : (
        <div className="grid-clases">
          {claseFiltradas.map((clase) => (
            <div key={clase.id} className="tarjeta-clase">
              <div className="clase-header">
                <h3>{clase.nombreTema}</h3>
                <span className={`badge-tema tema-${clase.numeroTema}`}>
                  Tema {clase.numeroTema}
                </span>
              </div>

              <div className="clase-body">
                <div className="info-clase">
                  <p className="fecha-clase">
                    📅 {obtenerFechaFormato(clase.fecha)}
                  </p>
                  <p className="hora-clase">
                    🕐 {clase.horaInicio} - {clase.horaFin}
                  </p>
                  <p className="profesor-clase">
                    👨‍🏫 {clase.nombreProfesor}
                  </p>
                  <p className="capacidad-clase">
                    👥 {clase.alumnosAgendados}/{clase.capacidadMaxima} inscritos
                  </p>
                </div>

                <div className="barra-capacidad">
                  <div
                    className="capacidad-usada"
                    style={{
                      width: `${(clase.alumnosAgendados / clase.capacidadMaxima) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="clase-footer">
                  {inscripciones.has(clase.id) ? (
                    <>
                      <span className="inscrito-badge">✓ Inscrito</span>
                      <button
                        onClick={() => desinscribirse(clase.id)}
                        className="btn-desinscribirse"
                      >
                        Cancelar Inscripción
                      </button>
                    </>
                  ) : clase.alumnosAgendados >= clase.capacidadMaxima ? (
                    <button disabled className="btn-lleno">
                      Clase Llena
                    </button>
                  ) : (
                    <button
                      onClick={() => inscribirse(clase.id)}
                      className="btn-inscribirse"
                    >
                      Inscribirse
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClasesPracticasDisponiblesAlumno;
