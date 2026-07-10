import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, Circle, Save, AlertCircle, Loader, Info, Ban } from "lucide-react";
import { Card, Button } from "../../components/shared/index.js";
import { colors, spacing } from "../../theme/index.js";
import { authService } from "../../services/authService.js";

const SalaPsicotecnicaAlumno = () => {
  const currentUser = authService.getCurrentUser();
  const alumnoId = currentUser?.alumnoId || currentUser?.id;

  const [fecha, setFecha] = useState("");
  const [bloques, setBloques] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [misReservas, setMisReservas] = useState([]); // Nuevo estado para las reservas del alumno
  
  const [loadingBloques, setLoadingBloques] = useState(false);
  const [loadingReservas, setLoadingReservas] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 1. Cargar las reservas existentes del alumno al montar el componente
  const fetchMisReservas = async () => {
    try {
      setLoadingReservas(true);
      const token = authService.getToken();
      // Asegúrate de tener este endpoint en tu backend, o ajusta la URL
      const response = await fetch(`http://localhost:5000/api/agendamiento/mis-reservas-psicotecnico`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMisReservas(data.data || []);
      }
    } catch (err) {
      console.error("Error al cargar reservas del alumno:", err);
    } finally {
      setLoadingReservas(false);
    }
  };

  // 2. Cargar disponibilidad de la sala según la fecha
  const fetchDisponibilidad = async (fechaSeleccionada) => {
    if (!fechaSeleccionada) return;
    try {
      setLoadingBloques(true);
      const token = authService.getToken();
      const response = await fetch(`http://localhost:5000/api/agendamiento/disponibilidad-sala?fecha=${fechaSeleccionada}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok || data.success) {
        setBloques(data.data || []);
        setSeleccionados([]); // Limpiar selección al cambiar de día
      }
    } catch (err) {
      setError("Error al cargar los horarios disponibles.");
    } finally {
      setLoadingBloques(false);
    }
  };

  useEffect(() => {
    fetchMisReservas();
  }, []);

  useEffect(() => {
    fetchDisponibilidad(fecha);
  }, [fecha]);

  const toggleBloque = (hora_inicio, disponible) => {
    if (!disponible) return; // Si está ocupado por otro, no hacer nada

    // 1. Contar cuántas reservas ya tiene el alumno guardadas en BD para ESA FECHA específica
    const reservasYaExistentes = misReservas.filter(r => r.fecha === fecha).length;

    setSeleccionados(prev => {
      // Si ya estaba seleccionado, lo desmarcamos
      if (prev.includes(hora_inicio)) {
        return prev.filter(h => h !== hora_inicio);
      } else {
        // Si va a marcar uno nuevo, sumamos los existentes + los que está marcando ahora
        if (reservasYaExistentes + prev.length >= 2) {
          setError(`Ya tienes ${reservasYaExistentes} bloque(s) reservado(s) para este día. El límite máximo es 2.`);
          setTimeout(() => setError(null), 4000);
          return prev; // Cancelar selección
        }
        return [...prev, hora_inicio];
      }
    });
  };

  const guardarReserva = async () => {
    if (seleccionados.length === 0) return;
    
    if (!window.confirm("¿Estás seguro de reservar estos bloques? Recuerda que NO podrás cancelar ni modificar esta reserva.")) {
      return;
    }

    try {
      setSaving(true);
      const token = authService.getToken();
      let algunError = null;
      
      // Enviamos las peticiones una por una para evaluar si el backend rechaza alguna
      for (const hora_inicio of seleccionados) {
        const response = await fetch("http://localhost:5000/api/agendamiento/agendar-bloque", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ fecha, hora_inicio })
        });

        const data = await response.json();
        
        // Si el backend nos responde con error (ej: límite excedido)
        if (!response.ok) {
          algunError = data.message || "Error al agendar uno de los bloques";
          break; // Detenemos el proceso si hay error
        }
      }

      // Si hubo un rechazo del backend, mostramos el error rojo. Si no, mostramos éxito.
      if (algunError) {
        setError(algunError);
      } else {
        setSuccess("Tus reservas en la sala psicotécnica han sido confirmadas.");
        setTimeout(() => setSuccess(null), 4000);
      }
      
      // Limpiamos la selección y recargamos los datos para sincronizar con la realidad
      setSeleccionados([]);
      fetchDisponibilidad(fecha);
      fetchMisReservas();
      
    } catch (err) {
      setError("Ocurrió un error de red al intentar guardar tu reserva.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* CABECERA */}
      <div style={{ marginBottom: spacing.margin.xlarge }}>
        <h2 style={{ fontSize: "32px", fontWeight: "bold", color: colors.textPrimary, margin: "0 0 8px 0" }}>
          Sala Psicotécnica
        </h2>
        <p style={{ fontSize: "16px", color: colors.textSecondary, margin: 0 }}>
          Reserva equipos psicotécnicos. Máximo 2 bloques (30 min) por día.
        </p>
      </div>

      {/* ALERTAS */}
      {error && (
        <div style={{ marginBottom: spacing.margin.lg, padding: spacing.padding.lg, backgroundColor: "#fee2e2", border: `1px solid ${colors.danger}`, borderRadius: spacing.radius.lg, color: colors.danger, display: "flex", alignItems: "center", gap: spacing.gap.normal, fontSize: "14px" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {success && (
        <div style={{ marginBottom: spacing.margin.lg, padding: spacing.padding.lg, backgroundColor: "#dcfce7", border: `1px solid ${colors.success}`, borderRadius: spacing.radius.lg, color: colors.success, display: "flex", alignItems: "center", gap: spacing.gap.normal, fontSize: "14px" }}>
          <CheckCircle size={18} /> {success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing.gap.spacious, marginBottom: spacing.margin.xlarge, '@media (max-width: 1024px)': { gridTemplateColumns: "1fr" } }}>
        
        {/* COLUMNA IZQUIERDA: ADVERTENCIA Y MIS RESERVAS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.gap.spacious }}>
          
          {/* BANNER DE ADVERTENCIA */}
          <div style={{ padding: spacing.padding.xlarge, backgroundColor: "#fffbeb", border: `2px solid #f59e0b`, borderRadius: spacing.radius.lg, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <AlertCircle size={24} color="#f59e0b" />
              <h3 style={{ margin: 0, color: "#b45309", fontSize: "18px", fontWeight: "bold" }}>¡Aviso Importante!</h3>
            </div>
            <p style={{ color: "#92400e", fontSize: "14px", lineHeight: "1.5", margin: 0 }}>
              <strong>Elige con consciencia:</strong> Una vez que confirmes tu reserva en la sala psicotécnica, <strong>no podrás retractarte, modificarla ni cancelarla</strong>. Si bloqueas un horario y no asistes, le quitarás la oportunidad a otro compañero.
            </p>
          </div>

          {/* MIS RESERVAS */}
          <Card title="Mis Reservas Confirmadas" icon={Clock}>
            {loadingReservas ? (
              <p style={{ textAlign: 'center', color: colors.textTertiary }}>Cargando tus reservas...</p>
            ) : misReservas.length === 0 ? (
              <div style={{ textAlign: "center", padding: spacing.padding.lg }}>
                <Info size={32} color={colors.textTertiary} style={{ margin: "0 auto 10px" }} />
                <p style={{ color: colors.textTertiary, margin: 0 }}>Aún no tienes reservas en la sala psicotécnica.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {misReservas.map((reserva, idx) => (
                  <div key={idx} style={{ padding: '12px', borderLeft: `4px solid ${colors.alumno}`, backgroundColor: colors.background, borderRadius: '6px' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: colors.textPrimary }}>
                      Fecha: {reserva.fecha}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: colors.textSecondary }}>
                      Horario: {reserva.hora_inicio} - {reserva.hora_fin}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* COLUMNA DERECHA: RESERVAR NUEVO HORARIO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.gap.spacious }}>
          <Card title="Elige una fecha" icon={Calendar}>
            <div style={{ display: "flex", alignItems: "center", gap: spacing.gap.normal, flexWrap: "wrap" }}>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                style={{ padding: "10px 15px", borderRadius: spacing.radius.md, border: `1px solid ${colors.borderLight}`, fontSize: "16px", outline: "none", cursor: "pointer" }}
              />
              <span style={{ fontSize: "14px", color: colors.textTertiary }}>
                Selecciona el día en el que deseas asistir a la sala.
              </span>
            </div>
          </Card>

          {fecha && (
            <Card title={`Horarios disponibles - ${fecha}`} icon={Clock}>
              {loadingBloques ? (
                <div style={{ padding: spacing.padding.xlarge, textAlign: "center", color: colors.textTertiary }}>
                  <Loader size={32} style={{ margin: "0 auto 12px", animation: "spin 1s linear infinite" }} />
                  Buscando horarios...
                </div>
              ) : bloques.length === 0 ? (
                <p style={{ textAlign: "center", color: colors.textTertiary, padding: spacing.padding.lg }}>
                  No hay horarios configurados o la sala está cerrada en esta fecha.
                </p>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: spacing.gap.normal, marginBottom: spacing.margin.xlarge }}>
                    {bloques.map((b, index) => {
                      const isSelected = seleccionados.includes(b.hora_inicio);
                      const isOcupado = !b.disponible;

                      return (
                        <div
                          key={index}
                          onClick={() => toggleBloque(b.hora_inicio, b.disponible)}
                          style={{
                            padding: spacing.padding.lg,
                            // Lógica de colores adaptada: Ocupado (Gris), Seleccionado (Verde), Libre (Rojo claro como en ReservarClase)
                            backgroundColor: isOcupado ? "#f8fafc" : isSelected ? "#f0fdf4" : "#fef2f2",
                            border: `2px solid ${isOcupado ? colors.borderLight : isSelected ? colors.success : colors.danger}`,
                            borderRadius: spacing.radius.md,
                            cursor: isOcupado ? "not-allowed" : "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: spacing.gap.normal,
                            opacity: isOcupado ? 0.7 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!isOcupado) {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isOcupado) {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }
                          }}
                        >
                          {/* ÍCONO */}
                          <div style={{ width: "40px", height: "40px", borderRadius: spacing.radius.full, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            backgroundColor: isOcupado ? "#e2e8f0" : isSelected ? "#dcfce7" : "#fee2e2",
                          }}>
                            {isOcupado ? (
                              <Ban size={24} color={colors.textTertiary} />
                            ) : isSelected ? (
                              <CheckCircle size={24} color={colors.success} />
                            ) : (
                              <Circle size={24} color={colors.danger} />
                            )}
                          </div>

                          {/* TEXTO */}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "14px", fontWeight: "600", color: isOcupado ? colors.textTertiary : colors.textPrimary, margin: "0 0 4px 0" }}>
                              {b.hora_inicio} - {b.hora_fin}
                            </p>
                            <p style={{ fontSize: "12px", margin: 0, fontWeight: "500",
                              color: isOcupado ? colors.textTertiary : isSelected ? colors.success : colors.danger,
                            }}>
                              {isOcupado ? "Ocupado" : isSelected ? "✓ Seleccionado" : "✗ Disponible"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    variant="success"
                    fullWidth={true}
                    onClick={guardarReserva}
                    disabled={saving || seleccionados.length === 0}
                    icon={Save}
                    size="lg"
                  >
                    {saving ? "Confirmando..." : `Confirmar ${seleccionados.length} bloque(s)`}
                  </Button>
                </>
              )}
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SalaPsicotecnicaAlumno;