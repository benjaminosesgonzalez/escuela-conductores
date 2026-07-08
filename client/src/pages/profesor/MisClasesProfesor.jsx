import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Circle, Save, AlertCircle, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

const MisClasesProfesor = () => {
  const currentUser = authService.getCurrentUser();
  const profesorId = currentUser?.id;

  const [disponibilidades, setDisponibilidades] = useState({});
  const [originalDisponibilidades, setOriginalDisponibilidades] = useState({});
  const [selectedDay, setSelectedDay] = useState('lunes');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [diasConCambios, setDiasConCambios] = useState([]);
  const [semanaActual, setSemanaActual] = useState(0);

  const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

  // Calcular fecha de inicio de la semana
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

  const obtenerFechaDelDia = (nombreDia) => {
    const { lunes } = obtenerFechasDelaSemana(semanaActual);
    const indice = diasSemana.indexOf(nombreDia);
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + indice);
    return fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  };

  const { lunes, viernes } = obtenerFechasDelaSemana(semanaActual);

  const cargarDisponibilidades = async () => {
    try {
      setLoading(true);
      if (!profesorId) {
        setError('No se pudo identificar al profesor');
        return;
      }

      const token = authService.getToken();
      const response = await fetch(
        `http://localhost:5000/api/disponibilidades/${profesorId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        // Filtrar bloques por la semana actual usando formato LOCAL (no UTC)
        const { lunes, viernes } = obtenerFechasDelaSemana(semanaActual);

        const lunesStr = String(lunes.getFullYear()) + '-' +
                         String(lunes.getMonth() + 1).padStart(2, '0') + '-' +
                         String(lunes.getDate()).padStart(2, '0');
        const viernesStr = String(viernes.getFullYear()) + '-' +
                           String(viernes.getMonth() + 1).padStart(2, '0') + '-' +
                           String(viernes.getDate()).padStart(2, '0');

        const bloquesFiltrados = {};

        if (data.data) {
          Object.keys(data.data).forEach(dia => {
            bloquesFiltrados[dia] = data.data[dia].filter(bloque => {
              // Si tiene fecha, filtrar por rango
              if (bloque.fecha) {
                return bloque.fecha >= lunesStr && bloque.fecha <= viernesStr;
              }
              // Si no tiene fecha, mostrar los bloques si es la semana actual (semana 0)
              // Los bloques sin fecha son bloques antiguos de antes de la actualización
              return semanaActual === 0;
            });
          });
        }

        setDisponibilidades(bloquesFiltrados);
        setOriginalDisponibilidades(JSON.parse(JSON.stringify(bloquesFiltrados)));
        setError(null);
        setDiasConCambios([]);
      } else {
        setError(data.message || 'Error al cargar disponibilidades');
      }
    } catch (err) {
      setError('No se pudieron cargar las disponibilidades');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async () => {
    try {
      setSaving(true);

      if (!profesorId) {
        setError('No se pudo identificar al profesor');
        setSaving(false);
        return;
      }

      // Obtener todos los bloques del día seleccionado
      const bloquesDelDia = disponibilidades[selectedDay] || [];

      if (bloquesDelDia.length === 0) {
        setError('No hay bloques para guardar. Primero genera bloques con la configuración.');
        setSaving(false);
        return;
      }

      const fecha = obtenerFechaDelDia(selectedDay);
      const idsYEstados = bloquesDelDia.map(b => ({
        id: b.id,
        disponible: b.disponible,
        fecha: fecha
      }));

      console.log('📝 Guardando cambios:', { profesorId, día: selectedDay, fecha, bloques: idsYEstados });

      const token = authService.getToken();

      if (!token) {
        setError('No hay sesión activa. Por favor, inicia sesión de nuevo.');
        setSaving(false);
        return;
      }

      const response = await fetch(
        'http://localhost:5000/api/disponibilidades/actualizar-multiples',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bloques: idsYEstados
          })
        }
      );

      console.log('📡 Respuesta del servidor:', response.status);
      const data = await response.json();
      console.log('📦 Datos recibidos:', data);

      if (data.success) {
        // Guardar la copia original del día para futuras comparaciones
        setOriginalDisponibilidades(prev => ({
          ...prev,
          [selectedDay]: JSON.parse(JSON.stringify(disponibilidades[selectedDay]))
        }));

        // Remover el día de la lista de días con cambios
        setDiasConCambios(prev => prev.filter(dia => dia !== selectedDay));

        const nombreDia = selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1);
        setSuccess(`✓ Disponibilidad de ${nombreDia} guardada correctamente`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Error al guardar los cambios');
      }
    } catch (err) {
      setError('Error al guardar los cambios: ' + err.message);
      console.error('❌ Error completo:', err);
    } finally {
      setSaving(false);
    }
  };


  const toggleBloque = (bloqueId) => {
    setDisponibilidades(prev => {
      const actualizado = {
        ...prev,
        [selectedDay]: prev[selectedDay].map(bloque =>
          bloque.id === bloqueId ? { ...bloque, disponible: !bloque.disponible } : bloque
        )
      };

      // Verificar si hay cambios en este día
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
    setDisponibilidades(prev => {
      const actualizado = {
        ...prev,
        [selectedDay]: prev[selectedDay].map(bloque => ({
          ...bloque,
          disponible: !todosDisponibles
        }))
      };

      // Verificar si hay cambios en este día
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
  }, [semanaActual]);

  const bloquesDelDia = disponibilidades[selectedDay] || [];
  const disponiblesDelDia = bloquesDelDia.filter(b => b.disponible).length;

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: spacing.margin.xlarge,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.gap.normal
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: colors.textPrimary,
            margin: '0 0 8px 0'
          }}>
            Mis clases - Disponibilidad
          </h2>
          <p style={{
            fontSize: '20px',
            color: colors.textSecondary,
            margin: 0
          }}>
            Gestiona tu disponibilidad para que los alumnos puedan reservar tus clases
          </p>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div style={{
          marginBottom: spacing.margin.lg,
          padding: spacing.padding.lg,
          backgroundColor: '#fee2e2',
          border: `1px solid ${colors.danger}`,
          borderRadius: spacing.radius.lg,
          color: colors.danger,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.gap.normal,
          fontSize: '14px'
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div style={{
          marginBottom: spacing.margin.lg,
          padding: spacing.padding.lg,
          backgroundColor: '#dcfce7',
          border: `1px solid ${colors.success}`,
          borderRadius: spacing.radius.lg,
          color: colors.success,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.gap.normal,
          fontSize: '14px'
        }}>
          <CheckCircle size={18} />
          {success}
        </div>
      )}


      {/* Selector de días y resumen */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: spacing.gap.spacious,
        marginBottom: spacing.margin.xlarge
      }}>
        <Card title="Días disponibles" icon={Calendar}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.gap.normal,
            marginBottom: spacing.margin.lg
          }}>
            <button
              onClick={() => setSemanaActual(Math.max(0, semanaActual - 1))}
              disabled={semanaActual === 0}
              style={{
                padding: spacing.padding.md,
                backgroundColor: semanaActual === 0 ? colors.borderLight : colors.borderLight,
                border: 'none',
                borderRadius: spacing.radius.md,
                cursor: semanaActual === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: semanaActual === 0 ? colors.textTertiary : colors.textPrimary,
                transition: 'all 0.2s ease',
                opacity: semanaActual === 0 ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (semanaActual > 0) {
                  e.currentTarget.style.backgroundColor = colors.border;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.borderLight;
              }}
            >
              <ChevronLeft size={20} />
            </button>

            <div style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '13px',
              color: colors.textSecondary,
              fontWeight: '500'
            }}>
              {formatearFecha(lunes)} - {formatearFecha(viernes)}
            </div>

            <button
              onClick={() => setSemanaActual(Math.min(3, semanaActual + 1))}
              disabled={semanaActual === 3}
              style={{
                padding: spacing.padding.md,
                backgroundColor: semanaActual === 3 ? colors.borderLight : colors.borderLight,
                border: 'none',
                borderRadius: spacing.radius.md,
                cursor: semanaActual === 3 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: semanaActual === 3 ? colors.textTertiary : colors.textPrimary,
                transition: 'all 0.2s ease',
                opacity: semanaActual === 3 ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (semanaActual < 3) {
                  e.currentTarget.style.backgroundColor = colors.border;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.borderLight;
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
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
                    backgroundColor: selectedDay === dia ? colors.primary : colors.borderLight,
                    color: selectedDay === dia ? colors.white : colors.textPrimary,
                    border: tieneCambios ? `2px solid ${colors.warning}` : 'none',
                    borderRadius: spacing.radius.md,
                    cursor: 'pointer',
                    fontSize: '26px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    textTransform: 'capitalize',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                  title={tieneCambios ? 'Cambios sin guardar' : ''}
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
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      width: '12px',
                      height: '12px',
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
              fontSize: '14px',
              fontWeight: '600',
              color: colors.textSecondary,
              margin: '0 0 12px 0',
              textTransform: 'capitalize'
            }}>
              {selectedDay}
            </h3>
            <p style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: colors.primary,
              margin: '0 0 8px 0'
            }}>
              {disponiblesDelDia}/{bloquesDelDia.length}
            </p>
            <p style={{
              fontSize: '13px',
              color: colors.textTertiary,
              margin: '0 0 16px 0'
            }}>
              bloques disponibles
            </p>

            <Button
              variant="secondary"
              size="md"
              fullWidth={true}
              onClick={toggleTodosDelDia}
            >
              {disponiblesDelDia === bloquesDelDia.length ? 'Desmarcar todos' : 'Marcar todos'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Bloques de disponibilidad */}
      <Card title={`Bloques de ${selectedDay}`} icon={Clock}>
        {loading ? (
          <div style={{
            padding: spacing.padding.xlarge,
            textAlign: 'center',
            color: colors.textTertiary
          }}>
            <Loader size={32} style={{
              margin: '0 auto 12px',
              animation: 'spin 1s linear infinite'
            }} />
            Cargando bloques...
          </div>
        ) : bloquesDelDia.length === 0 ? (
          <div style={{
            padding: spacing.padding.xlarge,
            textAlign: 'center',
            color: colors.textTertiary
          }}>
            No hay bloques configurados. Usa la configuración para generar bloques.
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: spacing.gap.normal,
              marginBottom: spacing.margin.xlarge
            }}>
              {bloquesDelDia.map(bloque => (
                <div
                  key={bloque.id}
                  onClick={() => toggleBloque(bloque.id)}
                  style={{
                    padding: spacing.padding.lg,
                    backgroundColor: bloque.disponible ? '#f0fdf4' : '#fef2f2',
                    border: `2px solid ${bloque.disponible ? colors.success : colors.danger}`,
                    borderRadius: spacing.radius.md,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.gap.normal
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: spacing.radius.full,
                    backgroundColor: bloque.disponible ? '#dcfce7' : '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                      fontSize: '14px',
                      fontWeight: '600',
                      color: colors.textPrimary,
                      margin: '0 0 4px 0'
                    }}>
                      {bloque.horaInicio} - {bloque.horaFin}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: bloque.disponible ? colors.success : colors.danger,
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {bloque.disponible ? '✓ Disponible' : '✗ No disponible'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="success"
              fullWidth={true}
              onClick={guardarCambios}
              disabled={saving || loading}
              icon={Save}
              size="lg"
              style={{ marginTop: spacing.margin.lg }}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
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

export default MisClasesProfesor;
