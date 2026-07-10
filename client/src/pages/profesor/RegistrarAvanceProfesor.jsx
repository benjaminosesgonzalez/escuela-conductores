import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Loader, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

const RegistrarAvanceProfesor = () => {
  const currentUser = authService.getCurrentUser();
  const profesorId = currentUser?.profesorId;

  const [clases, setClases] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClase, setSelectedClase] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const [registrando, setRegistrando] = useState(false);

  const cargarClasesDelDia = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!profesorId) {
        setError('No se pudo identificar al profesor');
        return;
      }

      const token = authService.getToken();
      const response = await fetch(
        `http://localhost:5000/api/avances-temas/instancias/del-dia?fecha=${selectedDate}&id_profesor=${profesorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setClases(data.clases || []);
      } else {
        setError(data.message || 'Error al cargar clases');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar clases del día');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalAsistencia = async (clase) => {
    try {
      setLoading(true);
      setError(null);
      const token = authService.getToken();

      const response = await fetch(
        `http://localhost:5000/api/avances-temas/${clase.id}/alumnos-inscritos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setSelectedClase(clase);
        setAlumnos(data.alumnos || []);
        setAlumnosSeleccionados(data.alumnos.map(a => ({ ...a, asistio: false })));
        setModalOpen(true);
      } else {
        setError(data.message || 'Error al cargar alumnos');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar alumnos inscritos');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlumno = (alumnoId) => {
    setAlumnosSeleccionados(prev =>
      prev.map(a =>
        a.alumnoId === alumnoId ? { ...a, asistio: !a.asistio } : a
      )
    );
  };

  const registrarAsistencia = async () => {
    try {
      setRegistrando(true);
      setError(null);
      const token = authService.getToken();

      const alumnosAsistieron = alumnosSeleccionados
        .filter(a => a.asistio)
        .map(a => a.alumnoId);

      const response = await fetch(
        `http://localhost:5000/api/avances-temas/${selectedClase.id}/registrar-asistencia`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ alumnos_asistieron: alumnosAsistieron }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setSuccess('Asistencia registrada correctamente');
        setModalOpen(false);
        setTimeout(() => setSuccess(null), 3000);
        cargarClasesDelDia();
      } else {
        setError(data.message || 'Error al registrar asistencia');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al registrar asistencia');
    } finally {
      setRegistrando(false);
    }
  };

  useEffect(() => {
    cargarClasesDelDia();
  }, [selectedDate, profesorId]);

  const cambiarFecha = (dias) => {
    const nuevaFecha = new Date(selectedDate);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setSelectedDate(nuevaFecha.toISOString().split('T')[0]);
  };

  const formatearFecha = (dateStr) => {
    const fecha = new Date(dateStr + 'T00:00:00');
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: spacing.margin.xlarge,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.gap.normal
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: spacing.radius.lg,
          backgroundColor: colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <CheckCircle size={28} color={colors.white} />
        </div>

        <div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: colors.textPrimary,
            margin: '0 0 4px 0'
          }}>
            Registrar avance
          </h2>
          <p style={{
            fontSize: '14px',
            color: colors.textSecondary,
            margin: 0
          }}>
            Marca la asistencia de los alumnos a las clases teóricas
          </p>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: `1px solid ${colors.danger}`,
          borderRadius: spacing.radius.md,
          padding: spacing.padding.md,
          marginBottom: spacing.margin.lg,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.gap.normal
        }}>
          <AlertCircle size={20} color={colors.danger} />
          <p style={{ color: colors.danger, margin: 0, fontSize: '14px' }}>{error}</p>
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#efe',
          border: `1px solid ${colors.success}`,
          borderRadius: spacing.radius.md,
          padding: spacing.padding.md,
          marginBottom: spacing.margin.lg,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.gap.normal
        }}>
          <CheckCircle size={20} color={colors.success} />
          <p style={{ color: colors.success, margin: 0, fontSize: '14px' }}>{success}</p>
        </div>
      )}

      {/* Selector de fecha */}
      <Card style={{ marginBottom: spacing.margin.xlarge }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.gap.normal
        }}>
          <button
            onClick={() => cambiarFecha(-1)}
            style={{
              backgroundColor: colors.backgroundAlt,
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.radius.md,
              padding: spacing.padding.sm,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.gap.normal,
            flex: 1
          }}>
            <Calendar size={20} color={colors.primary} />
            <div>
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                margin: '0 0 4px 0'
              }}>
                Selecciona una fecha
              </p>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: spacing.radius.md,
                  padding: spacing.padding.sm,
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <button
            onClick={() => cambiarFecha(1)}
            style={{
              backgroundColor: colors.backgroundAlt,
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.radius.md,
              padding: spacing.padding.sm,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronRight size={20} color={colors.textPrimary} />
          </button>
        </div>
      </Card>

      {/* Lista de clases */}
      <Card title="Clases del día" icon={Clock}>
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: spacing.padding.xlarge,
            color: colors.textTertiary
          }}>
            <Loader size={32} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            Cargando clases...
          </div>
        ) : clases.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: spacing.padding.xlarge,
            color: colors.textTertiary
          }}>
            No hay clases programadas para este día
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.gap.normal
          }}>
            {clases.map((clase) => (
              <div
                key={clase.id}
                style={{
                  backgroundColor: colors.backgroundAlt,
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: spacing.radius.md,
                  padding: spacing.padding.lg,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.borderLight;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <p style={{
                    margin: `0 0 ${spacing.margin.sm} 0`,
                    fontWeight: '600',
                    color: colors.textPrimary,
                    fontSize: '16px'
                  }}>
                    Tema {clase.numeroTema}: {clase.nombreTema}
                  </p>

                  <div style={{
                    display: 'flex',
                    gap: spacing.gap.xlarge,
                    marginTop: spacing.margin.sm
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.gap.sm }}>
                      <Clock size={14} color={colors.textSecondary} />
                      <p style={{
                        margin: 0,
                        fontSize: '13px',
                        color: colors.textSecondary
                      }}>
                        {clase.horaInicio} - {clase.horaFin}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.gap.sm }}>
                      <Users size={14} color={colors.textSecondary} />
                      <p style={{
                        margin: 0,
                        fontSize: '13px',
                        color: colors.textSecondary
                      }}>
                        {clase.cantidad_inscritos} inscritos
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={() => abrirModalAsistencia(clase)}
                  disabled={loading}
                >
                  Registrar
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de asistencia */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Card style={{
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.margin.lg
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 'bold',
                color: colors.textPrimary
              }}>
                Registrar asistencia
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={24} color={colors.textSecondary} />
              </button>
            </div>

            {selectedClase && (
              <p style={{
                fontSize: '14px',
                color: colors.textSecondary,
                marginBottom: spacing.margin.lg
              }}>
                Tema {selectedClase.numeroTema}: {selectedClase.nombreTema}
              </p>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.gap.normal,
              marginBottom: spacing.margin.lg
            }}>
              {alumnosSeleccionados.map((alumno) => (
                <label
                  key={alumno.alumnoId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.gap.normal,
                    padding: spacing.padding.md,
                    backgroundColor: colors.backgroundAlt,
                    borderRadius: spacing.radius.md,
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={alumno.asistio}
                    onChange={() => toggleAlumno(alumno.alumnoId)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <div>
                    <p style={{
                      margin: 0,
                      fontWeight: '500',
                      color: colors.textPrimary,
                      fontSize: '14px'
                    }}>
                      {alumno.nombre}
                    </p>
                    <p style={{
                      margin: '2px 0 0 0',
                      fontSize: '12px',
                      color: colors.textSecondary
                    }}>
                      {alumno.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div style={{
              display: 'flex',
              gap: spacing.gap.normal,
              justifyContent: 'flex-end'
            }}>
              <Button
                variant="secondary"
                onClick={() => setModalOpen(false)}
                disabled={registrando}
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                onClick={registrarAsistencia}
                disabled={registrando || alumnosSeleccionados.filter(a => a.asistio).length === 0}
              >
                {registrando ? 'Registrando...' : 'Confirmar asistencia'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegistrarAvanceProfesor;
