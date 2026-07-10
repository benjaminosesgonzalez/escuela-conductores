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
  const [puedeReservar, setPuedeReservar] = useState(true);
  const [temasCompletados, setTemasCompletados] = useState([false, false, false]);
  const [clasesInscritas, setClasesInscritas] = useState(0);
  const [maxClasesPlan, setMaxClasesPlan] = useState(0);
  const [alcanzadoMaximo, setAlcanzadoMaximo] = useState(false);

  useEffect(() => {
    verificarPuedeReservar();
    cargarClasesDisponibles();
  }, [semanaActual]);

  const verificarPuedeReservar = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?.alumnoId) return;

      const response = await fetch(
        `/api/avances-temas/${currentUser.alumnoId}/puede-reservar`,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );

      const data = await response.json();
      if (data.success && data.data) {
        setPuedeReservar(data.data.puede_reservar);
        setTemasCompletados(data.data.temas_completados);
      }
    } catch (error) {
      console.error("Error verificando permiso:", error);
    }
  };

  const cargarClasesDisponibles = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/clases-practicas-alumno/disponibles?semana=${semanaActual}`,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setClases(data.clases);
        // Cargar mis inscripciones
        cargarMisInscripciones();
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error al cargar las clases" });
    }
    setLoading(false);
  };

  const cargarMisInscripciones = async () => {
    try {
      const currentUser = authService.getCurrentUser();

      // Cargar inscripciones
      const response = await fetch(
        `/api/clases-practicas-alumno/mis-clases`,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
        }
      );
      const data = await response.json();

      if (data.success && data.clases) {
        const inscritos = new Set(data.clases.map(c => c.id));
        setInscripciones(inscritos);
        setClasesInscritas(data.clases.length);
      }

      // Cargar plan del alumno
      if (currentUser?.alumnoId) {
        try {
          const respPlan = await fetch(
            `/api/alumnos/${currentUser.alumnoId}/plan`,
            {
              headers: {
                Authorization: `Bearer ${authService.getToken()}`,
              },
            }
          );
          const dataPlan = await respPlan.json();

          if (dataPlan.success) {
            const maxClases = {
              1: 4,   // Básico
              2: 8,   // Intermedio
              3: 12   // Avanzado
            }[dataPlan.plan_id] || 4;

            setMaxClasesPlan(maxClases);

            // Verificar si alcanzó el máximo
            if (data.success && data.clases) {
              setAlcanzadoMaximo(data.clases.length >= maxClases);
            }
          }
        } catch (error) {
          console.error("Error al cargar plan:", error);
          setMaxClasesPlan(4); // Default
        }
      }
    } catch (error) {
      console.error("Error al cargar mis inscripciones:", error);
    }
  };

  const inscribirse = async (claseId) => {
    try {
      const response = await fetch(
        `/api/clases-practicas-alumno/${claseId}/inscribirse`,
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
        const nuevasInscripciones = new Set([...inscripciones, claseId]);
        setInscripciones(nuevasInscripciones);
        setClasesInscritas(nuevasInscripciones.size);
        setAlcanzadoMaximo(nuevasInscripciones.size >= maxClasesPlan);
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
        texto: "Error al inscribirse en la clase",
      });
    }

    setTimeout(() => setMensaje(null), 3000);
  };

  const desinscribirse = async (claseId) => {
    try {
      const response = await fetch(
        `/api/clases-practicas-alumno/${claseId}/desinscribirse`,
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
        setClasesInscritas(nuevas.size);
        setAlcanzadoMaximo(nuevas.size >= maxClasesPlan);
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

  const obtenerFechasDelaSemana = (semanaOffset = 0) => {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diasAlLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diasAlLunes + (semanaOffset * 7));

    const viernes = new Date(lunes);
    viernes.setDate(lunes.getDate() + 4);

    return { lunes, viernes };
  };

  const formatearFechaCorta = (fecha) => {
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const obtenerLabelSemana = () => {
    const { lunes, viernes } = obtenerFechasDelaSemana(semanaActual);
    return `${formatearFechaCorta(lunes)} - ${formatearFechaCorta(viernes)}`;
  };

  const claseFiltradas = clases.filter((c) => {
    const coincideProfesor = !filtroProfesor ||
      c.nombreProfesor?.toLowerCase().includes(filtroProfesor.toLowerCase());
    return coincideProfesor;
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>🚗 Reservar Clase Práctica</h2>
          {maxClasesPlan > 0 && (
            <div style={{
              padding: '8px 16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #0284c7',
              textAlign: 'right'
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Total Clases Prácticas</p>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '16px',
                fontWeight: 'bold',
                color: alcanzadoMaximo ? '#dc2626' : '#0284c7'
              }}>
                {clasesInscritas}/{maxClasesPlan}
              </p>
            </div>
          )}
        </div>
        <div className="controles-semana">
          <button
            onClick={() => setSemanaActual(Math.max(0, semanaActual - 1))}
            disabled={semanaActual === 0}
            className="btn-semana"
          >
            ← Semana Anterior
          </button>
          <span className="semana-label">
            {obtenerLabelSemana()}
          </span>
          <button
            onClick={() => setSemanaActual(Math.min(3, semanaActual + 1))}
            disabled={semanaActual === 3}
            className="btn-semana"
          >
            Próxima Semana →
          </button>
        </div>
      </div>

      {!puedeReservar && (
        <div className="mensaje mensaje-error">
          ⚠️ Debes completar las primeras 3 clases teóricas para acceder a clases prácticas.
          <br />
          Progreso: {temasCompletados.filter(t => t).length}/3 completadas
        </div>
      )}

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

      {alcanzadoMaximo && (
        <div className="mensaje mensaje-error">
          ⚠️ Has alcanzado el límite de clases prácticas ({clasesInscritas}/{maxClasesPlan}) para tu plan actual.
          <br />
          Para inscribirse en más clases, debes desinscribirte de alguna clase existente.
        </div>
      )}

      {!puedeReservar ? (
        <div className="sin-clases">
          No puedes reservar clases prácticas hasta completar las primeras 3 clases teóricas.
        </div>
      ) : loading ? (
        <div className="cargando">Cargando clases...</div>
      ) : claseFiltradas.length === 0 ? (
        <div className="sin-clases">No hay clases disponibles en esta semana</div>
      ) : (
        <div className="grid-clases">
          {claseFiltradas.map((clase) => (
            <div key={clase.id} className="tarjeta-clase">
              <div className="clase-header">
                <h3>Clase Práctica</h3>
                <span className="badge-tema">🚗 Conducción</span>
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
                    👥 Cupo única (1 alumno)
                  </p>
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
                  ) : clase.estado === 'disponible' ? (
                    <button
                      onClick={() => inscribirse(clase.id)}
                      className="btn-inscribirse"
                      disabled={alcanzadoMaximo}
                      title={alcanzadoMaximo ? `Has alcanzado el límite de ${maxClasesPlan} clases prácticas para tu plan` : ''}
                    >
                      {alcanzadoMaximo ? '❌ Límite alcanzado' : 'Inscribirse'}
                    </button>
                  ) : (
                    <button disabled className="btn-lleno">
                      No Disponible
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
