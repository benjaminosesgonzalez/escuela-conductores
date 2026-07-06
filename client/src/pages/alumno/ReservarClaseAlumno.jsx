import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, Circle, Save, AlertCircle, Loader } from "lucide-react";
import { Card, Button } from "../../components/shared/index.js";
import { colors, spacing } from "../../theme/index.js";
import { authService } from "../../services/authService.js";

const ReservarClaseAlumno = () => {
  const currentUser = authService.getCurrentUser();
  // Usar alumnoId si existe (para alumnos), si no usar id como fallback
  const alumnoId = currentUser?.alumnoId || currentUser?.id;

  const [disponibilidades, setDisponibilidades] = useState({});
  const [originalDisponibilidades, setOriginalDisponibilidades] = useState({});
  const [selectedDay, setSelectedDay] = useState("lunes");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [diasConCambios, setDiasConCambios] = useState([]);
  const [generando, setGenerando] = useState(false);
  const [planInfo, setPlanInfo] = useState(null);

  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes"];

  // Usar planInfo del login si está disponible
  useEffect(() => {
    const userPlanInfo = currentUser?.planInfo;
    if (userPlanInfo) {
      setPlanInfo(userPlanInfo);
    }
  }, []);

  const generarBloquesAutomaticamente = async () => {
    try {
      setGenerando(true);
      if (!alumnoId) {
        setError("No se pudo identificar al alumno");
        return;
      }

      const token = authService.getToken();
      const response = await fetch(
        `http://localhost:5000/api/disponibilidades-alumnos/${alumnoId}/generar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            diasLaboral: ["lunes", "martes", "miércoles", "jueves", "viernes"]
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        await cargarDisponibilidades();
        setSuccess("Horarios generados correctamente");
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError(data.message || "Error al generar horarios");
      }
    } catch (err) {
      setError("Error al generar horarios");
      console.error(err);
    } finally {
      setGenerando(false);
    }
  };

  const cargarDisponibilidades = async () => {
    try {
      setLoading(true);
      if (!alumnoId) {
        setError("No se pudo identificar al alumno");
        return;
      }

      const token = authService.getToken();
      const response = await fetch(
        `http://localhost:5000/api/disponibilidades-alumnos/${alumnoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setDisponibilidades(data.data || {});
        setOriginalDisponibilidades(JSON.parse(JSON.stringify(data.data || {})));
        setError(null);
        setDiasConCambios([]);
      } else {
        setError(data.message || "Error al cargar horarios disponibles");
      }
    } catch (err) {
      setError("No se pudieron cargar los horarios");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const guardarReserva = async () => {
    try {
      setSaving(true);

      if (!alumnoId) {
        setError("No se pudo identificar al alumno");
        setSaving(false);
        return;
      }

      const bloquesDelDia = disponibilidades[selectedDay] || [];

      if (bloquesDelDia.length === 0) {
        setError("No hay horarios disponibles. Por favor intenta más tarde.");
        setSaving(false);
        return;
      }

      const idsYEstados = bloquesDelDia.map(b => ({
        id: b.id,
        disponible: b.disponible
      }));

      const token = authService.getToken();

      if (!token) {
        setError("No hay sesión activa. Por favor, inicia sesión de nuevo.");
        setSaving(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/disponibilidades-alumnos/actualizar-multiples",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            bloques: idsYEstados
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setOriginalDisponibilidades(prev => ({
          ...prev,
          [selectedDay]: JSON.parse(JSON.stringify(disponibilidades[selectedDay]))
        }));

        setDiasConCambios(prev => prev.filter(dia => dia !== selectedDay));

        const nombreDia = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1);
        setSuccess(`✓ Reserva de ${nombreDia} guardada. La secretaría confirmará tu clase.`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || "Error al guardar la reserva");
      }
    } catch (err) {
      setError("Error al guardar la reserva: " + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleBloque = (bloqueId) => {
    setDisponibilidades(prev => {
      const bloqueActual = prev[selectedDay].find(b => b.id === bloqueId);

      // Si va a seleccionar y ya tiene el máximo, no permitir
      if (!bloqueActual.disponible && planInfo) {
        const totalSeleccionados = Object.values(prev).flat().filter(b => b.disponible).length;
        if (totalSeleccionados >= planInfo.total_classes) {
          setError(`Ya tienes el máximo de clases seleccionadas (${planInfo.total_classes})`);
          setTimeout(() => setError(null), 3000);
          return prev;
        }
      }

      const actualizado = {
        ...prev,
        [selectedDay]: prev[selectedDay].map(bloque =>
          bloque.id === bloqueId ? { ...bloque, disponible: !bloque.disponible } : bloque
        )
      };

      const bloquesCambiaron = JSON.stringify(actualizado[selectedDay]) !==
                               JSON.stringify(originalDisponibilidades[selectedDay]);

      if (bloquesCambiaron && !diasConCambios.includes(selectedDay)) {
        setDiasConCambios(prev => [...prev, selectedDay]);
      }

      return actualizado;
    });
  };

  const toggleTodosDelDia = () => {
    const todosDisponibles = disponibilidades[selectedDay]?.every(b => b.disponible);

    // Si va a marcar todos y eso excede el máximo, no permitir
    if (!todosDisponibles && planInfo) {
      const totalSeleccionados = Object.values(disponibilidades).flat().filter(b => b.disponible).length;
      const bloquesDia = disponibilidades[selectedDay]?.length || 0;
      const nuevosSeleccionados = totalSeleccionados + bloquesDia;

      if (nuevosSeleccionados > planInfo.total_classes) {
        setError(`Solo puedes seleccionar ${planInfo.total_classes} clases en total`);
        setTimeout(() => setError(null), 3000);
        return;
      }
    }

    setDisponibilidades(prev => {
      const actualizado = {
        ...prev,
        [selectedDay]: prev[selectedDay].map(bloque => ({
          ...bloque,
          disponible: !todosDisponibles
        }))
      };

      const bloquesCambiaron = JSON.stringify(actualizado[selectedDay]) !==
                               JSON.stringify(originalDisponibilidades[selectedDay]);

      if (bloquesCambiaron && !diasConCambios.includes(selectedDay)) {
        setDiasConCambios(prev => [...prev, selectedDay]);
      }

      return actualizado;
    });
  };

  useEffect(() => {
    cargarDisponibilidades();
  }, []);

  const bloquesDelDia = disponibilidades[selectedDay] || [];
  const seleccionadosDelDia = bloquesDelDia.filter(b => b.disponible).length;
  const totalSeleccionados = Object.values(disponibilidades).flat().filter(b => b.disponible).length;

  return (
    <div>
      <div style={{
        marginBottom: spacing.margin.xlarge,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: spacing.gap.normal
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: "32px",
            fontWeight: "bold",
            color: colors.textPrimary,
            margin: "0 0 8px 0"
          }}>
            Reservar clase
          </h2>
          <p style={{
            fontSize: "20px",
            color: colors.textSecondary,
            margin: 0
          }}>
            Selecciona los horarios en que deseas tomar tus clases. La secretaría confirmará tu reserva.
            {planInfo && (
              <span style={{ color: colors.primary, fontWeight: 'bold', display: 'block', marginTop: '8px' }}>
                Máximo: {planInfo.total_classes} clases ({planInfo.name})
              </span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          marginBottom: spacing.margin.lg,
          padding: spacing.padding.lg,
          backgroundColor: "#fee2e2",
          border: `1px solid ${colors.danger}`,
          borderRadius: spacing.radius.lg,
          color: colors.danger,
          display: "flex",
          alignItems: "center",
          gap: spacing.gap.normal,
          fontSize: "14px"
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div style={{
          marginBottom: spacing.margin.lg,
          padding: spacing.padding.lg,
          backgroundColor: "#dcfce7",
          border: `1px solid ${colors.success}`,
          borderRadius: spacing.radius.lg,
          color: colors.success,
          display: "flex",
          alignItems: "center",
          gap: spacing.gap.normal,
          fontSize: "14px"
        }}>
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: spacing.gap.spacious,
        marginBottom: spacing.margin.xlarge
      }}>
        <Card title="Selecciona un día" icon={Calendar}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
            gap: spacing.gap.tight
          }}>
            {diasSemana.map((dia) => {
              const tieneCambios = diasConCambios.includes(dia);
              return (
                <button
                  key={dia}
                  onClick={() => setSelectedDay(dia)}
                  style={{
                    padding: `${spacing.padding.md} ${spacing.padding.lg}`,
                    backgroundColor: selectedDay === dia ? colors.alumno : colors.borderLight,
                    color: selectedDay === dia ? colors.white : colors.textPrimary,
                    border: tieneCambios ? `2px solid ${colors.warning}` : "none",
                    borderRadius: spacing.radius.md,
                    cursor: "pointer",
                    fontSize: "26px",
                    fontWeight: "600",
                    transition: "all 0.2s ease",
                    textTransform: "capitalize",
                    textAlign: "center",
                    position: "relative"
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDay !== dia) {
                      e.currentTarget.style.backgroundColor = colors.border;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDay !== dia) {
                      e.currentTarget.style.backgroundColor = colors.borderLight;
                    }
                  }}
                >
                  {dia.slice(0, 3)}
                  {tieneCambios && (
                    <span style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      width: "12px",
                      height: "12px",
                      backgroundColor: colors.warning,
                      borderRadius: spacing.radius.full,
                      border: `2px solid ${colors.white}`
                    }}></span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div>
            <h3 style={{
              fontSize: "14px",
              fontWeight: "600",
              color: colors.textSecondary,
              margin: "0 0 12px 0",
              textTransform: "capitalize"
            }}>
              {selectedDay}
            </h3>
            <p style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: colors.alumno,
              margin: "0 0 8px 0"
            }}>
              {totalSeleccionados}/{planInfo?.total_classes || "?"}
            </p>
            <p style={{
              fontSize: "13px",
              color: colors.textTertiary,
              margin: "0 0 16px 0"
            }}>
              clases seleccionadas total
            </p>

            <Button
              variant="secondary"
              size="md"
              fullWidth={true}
              onClick={toggleTodosDelDia}
            >
              {seleccionadosDelDia === bloquesDelDia.length ? "Deseleccionar todas" : "Seleccionar todas"}
            </Button>
          </div>
        </Card>
      </div>

      <Card title={`Horarios disponibles - ${selectedDay}`} icon={Clock}>
        {loading ? (
          <div style={{
            padding: spacing.padding.xlarge,
            textAlign: "center",
            color: colors.textTertiary
          }}>
            <Loader size={32} style={{
              margin: "0 auto 12px",
              animation: "spin 1s linear infinite"
            }} />
            Cargando horarios...
          </div>
        ) : Object.keys(disponibilidades).length === 0 ? (
          <div style={{
            padding: spacing.padding.xlarge,
            textAlign: "center"
          }}>
            <p style={{
              color: colors.textTertiary,
              marginBottom: spacing.margin.lg
            }}>
              No hay horarios generados. Haz clic en el botón para generar tus bloques de disponibilidad.
            </p>
            <Button
              variant="primary"
              onClick={generarBloquesAutomaticamente}
              disabled={generando}
            >
              {generando ? "Generando..." : "Generar mis horarios"}
            </Button>
          </div>
        ) : bloquesDelDia.length === 0 ? (
          <div style={{
            padding: spacing.padding.xlarge,
            textAlign: "center",
            color: colors.textTertiary
          }}>
            No hay horarios disponibles para este día. Intenta otro día de la semana.
          </div>
        ) : (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: spacing.gap.normal,
              marginBottom: spacing.margin.xlarge
            }}>
              {bloquesDelDia.map(bloque => (
                <div
                  key={bloque.id}
                  onClick={() => toggleBloque(bloque.id)}
                  style={{
                    padding: spacing.padding.lg,
                    backgroundColor: bloque.disponible ? "#f0fdf4" : "#fef2f2",
                    border: `2px solid ${bloque.disponible ? colors.success : colors.danger}`,
                    borderRadius: spacing.radius.md,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: spacing.gap.normal
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: spacing.radius.full,
                    backgroundColor: bloque.disponible ? "#dcfce7" : "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {bloque.disponible ? (
                      <CheckCircle size={24} color={colors.success} />
                    ) : (
                      <Circle size={24} color={colors.danger} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: colors.textPrimary,
                      margin: "0 0 4px 0"
                    }}>
                      {bloque.horaInicio} - {bloque.horaFin}
                    </p>
                    <p style={{
                      fontSize: "12px",
                      color: bloque.disponible ? colors.success : colors.danger,
                      margin: 0,
                      fontWeight: "500"
                    }}>
                      {bloque.disponible ? "✓ Seleccionado" : "✗ No seleccionado"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="success"
              fullWidth={true}
              onClick={guardarReserva}
              disabled={saving || loading}
              icon={Save}
              size="lg"
              style={{ marginTop: spacing.margin.lg }}
            >
              {saving ? "Guardando reserva..." : "Confirmar reserva"}
            </Button>
          </>
        )}
      </Card>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReservarClaseAlumno;
