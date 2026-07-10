import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Loader, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

const RegistrarAvanceProfesor = () => {
  const currentUser = authService.getCurrentUser();
  const profesorId = currentUser?.profesorId;

  const [clasesOnline, setClasesOnline] = useState({});
  const [selectedDay, setSelectedDay] = useState('lunes');
  const [semanaActual, setSemanaActual] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClase, setSelectedClase] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const [registrando, setRegistrando] = useState(false);

  const [modalMaterialOpen, setModalMaterialOpen] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [asignandoMaterial, setAsignandoMaterial] = useState(false);
  const [materialesClase, setMaterialesClase] = useState({});
  const [hoveredClaseId, setHoveredClaseId] = useState(null);

  const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

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

  const formatearFecha = (fecha) => {
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const { lunes, viernes } = obtenerFechasDelaSemana(semanaActual);

  const cargarClasesOnline = async () => {
    try {
      setLoading(true);
      if (!profesorId) {
        setError('No se pudo identificar al profesor');
        return;
      }

      const token = authService.getToken();
      const response = await fetch(
        `http://localhost:5000/api/clases-online/${profesorId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        const { lunes, viernes } = obtenerFechasDelaSemana(semanaActual);

        const lunesStr = String(lunes.getFullYear()) + '-' +
                         String(lunes.getMonth() + 1).padStart(2, '0') + '-' +
                         String(lunes.getDate()).padStart(2, '0');
        const viernesStr = String(viernes.getFullYear()) + '-' +
                           String(viernes.getMonth() + 1).padStart(2, '0') + '-' +
                           String(viernes.getDate()).padStart(2, '0');

        const clasesFiltradas = {};

        if (data.data) {
          Object.keys(data.data).forEach(dia => {
            clasesFiltradas[dia] = data.data[dia]
              .filter(clase => {
                if (clase.tipoDisponibilidad === 'teorica' && clase.fecha) {
                  return clase.fecha >= lunesStr && clase.fecha <= viernesStr;
                }
                return semanaActual === 0;
              });
          });
        }

        setClasesOnline(clasesFiltradas);
        setError(null);

        // Cargar materiales de todas las clases
        Object.values(clasesFiltradas).forEach(diasClases => {
          diasClases.forEach(clase => {
            obtenerMaterialesClaseFunc(clase.id);
          });
        });
      } else {
        setError(data.message || 'Error al cargar clases online');
      }
    } catch (err) {
      setError('No se pudieron cargar las clases online');
      console.error(err);
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
        cargarClasesOnline();
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

  const obtenerMaterialesClaseFunc = async (claseId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/clase-material/${claseId}/materiales`
      );

      const data = await response.json();
      if (data.success) {
        setMaterialesClase(prev => ({
          ...prev,
          [claseId]: data.materiales || []
        }));
      }
    } catch (err) {
      console.error('Error obteniendo materiales:', err);
    }
  };

  const cargarArchivos = async () => {
    try {
      const token = authService.getToken();
      const response = await fetch(
        `http://localhost:5000/api/clase-material/${profesorId}/archivos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setArchivos(data.archivos || []);
      } else {
        setError('Error al cargar archivos');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar archivos');
    }
  };

  const asignarMaterial = async () => {
    if (!archivoSeleccionado) {
      setError('Selecciona un archivo');
      return;
    }

    try {
      setAsignandoMaterial(true);
      setError(null);
      const token = authService.getToken();

      const fechaDia = obtenerFechaDelDia(selectedDay);

      const response = await fetch(
        `http://localhost:5000/api/clase-material/asignar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profesorId,
            fechaDia,
            repositorioArchivoId: archivoSeleccionado.id,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setSuccess(`Material asignado a ${data.clasesAfectadas} clase(s)`);
        setModalMaterialOpen(false);
        setArchivoSeleccionado(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Error al asignar material');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al asignar material');
    } finally {
      setAsignandoMaterial(false);
    }
  };

  const obtenerFechaDelDia = (nombreDia) => {
    const { lunes } = obtenerFechasDelaSemana(semanaActual);
    const indice = diasSemana.indexOf(nombreDia);
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + indice);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  useEffect(() => {
    cargarClasesOnline();
  }, [semanaActual, profesorId]);

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

      {/* Selector de semana */}
      <Card style={{ marginBottom: spacing.margin.xlarge, maxWidth: '45%', marginLeft: 'auto', marginRight: 0, marginTop: '-120px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.gap.normal
        }}>
          <button
            onClick={() => setSemanaActual(semanaActual - 1)}
            style={{
              backgroundColor: colors.primary,
              color: 'white',
              border: `1px solid ${colors.primary}`,
              borderRadius: spacing.radius.md,
              padding: spacing.padding.sm,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ← Semana anterior
          </button>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <p style={{
              fontSize: '18px',
              color: colors.textSecondary,
              margin: '0 0 10px 0',
              fontWeight: 'bold'
            }}>
              {`${formatearFecha(lunes)} - ${formatearFecha(viernes)}`}
            </p>
            <div style={{
              display: 'flex',
              gap: spacing.gap.normal,
              justifyContent: 'center'
            }}>
              {diasSemana.map((dia) => (
                <button
                  key={dia}
                  onClick={() => setSelectedDay(dia)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: selectedDay === dia ? colors.primary : colors.primary,
                    color: 'white',
                    border: `1px solid ${selectedDay === dia ? colors.primary : colors.primary}`,
                    borderRadius: spacing.radius.md,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    textTransform: 'capitalize',
                    opacity: selectedDay === dia ? 1 : 0.6
                  }}
                >
                  {dia.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSemanaActual(semanaActual + 1)}
            style={{
              backgroundColor: colors.primary,
              color: 'white',
              border: `1px solid ${colors.primary}`,
              borderRadius: spacing.radius.md,
              padding: spacing.padding.sm,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Próxima semana →
          </button>
        </div>
      </Card>

      {/* Lista de clases */}
      <div style={{
        position: 'relative',
        marginBottom: spacing.margin.xlarge
      }}>
        <div style={{
          position: 'absolute',
          top: spacing.padding.xlarge,
          right: spacing.padding.xlarge,
          zIndex: 10
        }}>
          <button
            onClick={() => {
              setModalMaterialOpen(true);
              cargarArchivos();
            }}
            style={{
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: spacing.radius.md,
              padding: `${spacing.padding.md} ${spacing.padding.lg}`,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '20px'
            }}
          >
            + Agregar Material
          </button>
        </div>

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
        ) : (clasesOnline[selectedDay] || []).length === 0 ? (
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
            {(clasesOnline[selectedDay] || []).map((clase) => {
              const tieneMateria = materialesClase[clase.id] && materialesClase[clase.id].length > 0;

              return (
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
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  if (!tieneMateria) return;
                  obtenerMaterialesClaseFunc(clase.id);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.borderLight;
                  e.currentTarget.style.boxShadow = 'none';
                  setHoveredClaseId(null);
                }}
              >
                <div>
                  <p style={{
                    margin: `0 0 ${spacing.margin.sm} 0`,
                    fontWeight: '600',
                    color: colors.textPrimary,
                    fontSize: '20px'
                  }}>
                    Tema {clase.numeroTema}: {clase.nombreTema}
                  </p>

                  <div style={{
                    display: 'flex',
                    gap: '48px',
                    marginTop: spacing.margin.sm
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.gap.sm }}>
                      <Clock size={16} color={colors.textSecondary} />
                      <p style={{
                        margin: 0,
                        fontSize: '17px',
                        color: colors.textSecondary
                      }}>
                        {clase.horaInicio} - {clase.horaFin}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.gap.lg }}>
                      <Users size={16} color={colors.textSecondary} />
                      <p style={{
                        margin: 0,
                        fontSize: '17px',
                        color: colors.textSecondary
                      }}>
                        {clase.alumnosAgendados}/{clase.capacidadMaxima} inscritos
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.gap.lg,
                  position: 'relative'
                }}>
                  {tieneMateria && (
                    <div
                      onMouseEnter={() => setHoveredClaseId(clase.id)}
                      onMouseLeave={() => setHoveredClaseId(null)}
                      style={{
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#fef3c7',
                        borderRadius: spacing.radius.md,
                        color: '#d97706'
                      }}>
                        📄
                      </span>

                      {hoveredClaseId === clase.id && (
                        <div style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 8px)',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#1f2937',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                          zIndex: 100,
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                          pointerEvents: 'none'
                        }}>
                          {(materialesClase[clase.id] || []).map(m => m.nombre).join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    variant="primary"
                    onClick={() => abrirModalAsistencia(clase)}
                    disabled={loading}
                  >
                    Registrar
                  </Button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </Card>
      </div>

      {/* Modal de Material */}
      {modalMaterialOpen && (
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
                Seleccionar Material
              </h3>
              <button
                onClick={() => setModalMaterialOpen(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <X size={24} color={colors.textSecondary} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.gap.normal,
              marginBottom: spacing.margin.lg,
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {archivos.length === 0 ? (
                <p style={{
                  textAlign: 'center',
                  color: colors.textSecondary,
                  padding: spacing.padding.lg
                }}>
                  No hay archivos disponibles
                </p>
              ) : (
                archivos.map((archivo) => (
                  <label
                    key={archivo.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.gap.normal,
                      padding: spacing.padding.md,
                      backgroundColor: archivoSeleccionado?.id === archivo.id ? colors.primary + '20' : colors.backgroundAlt,
                      borderRadius: spacing.radius.md,
                      cursor: 'pointer',
                      border: archivoSeleccionado?.id === archivo.id ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`
                    }}
                  >
                    <input
                      type="radio"
                      name="archivo"
                      checked={archivoSeleccionado?.id === archivo.id}
                      onChange={() => setArchivoSeleccionado(archivo)}
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
                        {archivo.nombreOriginal}
                      </p>
                      <p style={{
                        margin: '2px 0 0 0',
                        fontSize: '12px',
                        color: colors.textSecondary
                      }}>
                        {archivo.tipoArchivo}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: spacing.gap.normal,
              justifyContent: 'flex-end'
            }}>
              <Button
                variant="secondary"
                onClick={() => setModalMaterialOpen(false)}
                disabled={asignandoMaterial}
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                onClick={asignarMaterial}
                disabled={asignandoMaterial || !archivoSeleccionado}
              >
                {asignandoMaterial ? 'Asignando...' : 'Asignar Material'}
              </Button>
            </div>
          </Card>
        </div>
      )}

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
