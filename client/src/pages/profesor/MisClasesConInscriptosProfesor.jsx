import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, AlertCircle, Loader, ChevronLeft, ChevronRight, Copy, ExternalLink } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

const MisClasesConInscriptosProfesor = () => {
  const currentUser = authService.getCurrentUser();
  const profesorId = currentUser?.profesorId;

  const [clasesOnline, setClasesOnline] = useState({});
  const [selectedDay, setSelectedDay] = useState('lunes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [semanaActual, setSemanaActual] = useState(0);
  const [updatingZoom, setUpdatingZoom] = useState(null);

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
        `http://localhost:5000/api/clases-online/${profesorId}/futuras`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        // Filtrar clases por la semana actual
        const { lunes, viernes } = obtenerFechasDelaSemana(semanaActual);
        const lunesStr = lunes.toISOString().split('T')[0];
        const viernesStr = viernes.toISOString().split('T')[0];
        const clasesFiltradas = {};

        if (data.data) {
          Object.keys(data.data).forEach(dia => {
            clasesFiltradas[dia] = data.data[dia].filter(clase => {
              if (clase.fecha) {
                return clase.fecha >= lunesStr && clase.fecha <= viernesStr;
              }
              // Si no tiene fecha, mostrar en la semana actual (semana 0)
              return semanaActual === 0;
            });
          });
        }

        setClasesOnline(clasesFiltradas);
        setError(null);
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

  const actualizarLinkZoom = async (claseOnlineId, linkZoom) => {
    try {
      setUpdatingZoom(claseOnlineId);
      const token = authService.getToken();

      const response = await fetch(
        `http://localhost:5000/api/clases-online/${claseOnlineId}/zoom`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ linkZoom })
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess('Link Zoom actualizado correctamente');
        setTimeout(() => setSuccess(null), 2000);
        await cargarClasesOnline();
      } else {
        setError(data.message || 'Error al actualizar link');
      }
    } catch (err) {
      setError('Error al actualizar link Zoom');
      console.error(err);
    } finally {
      setUpdatingZoom(null);
    }
  };

  const copiarLink = (linkZoom) => {
    navigator.clipboard.writeText(linkZoom);
    setSuccess('Link copiado al portapapeles');
    setTimeout(() => setSuccess(null), 2000);
  };

  useEffect(() => {
    cargarClasesOnline();
  }, [semanaActual]);

  const clasesDelDia = clasesOnline[selectedDay] || [];

  return (
    <div>
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
            Mis clases online
          </h2>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            margin: 0
          }}>
            Clases con alumnos inscritos - Gestiona tus enlaces de Zoom
          </p>
        </div>
      </div>

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
          fontSize: '14px'
        }}>
          {success}
        </div>
      )}

      <Card title="Selecciona un día" icon={Calendar}>
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
              opacity: semanaActual === 0 ? 0.5 : 1
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
            onClick={() => setSemanaActual(Math.min(1, semanaActual + 1))}
            disabled={semanaActual === 1}
            style={{
              padding: spacing.padding.md,
              backgroundColor: semanaActual === 1 ? colors.borderLight : colors.borderLight,
              border: 'none',
              borderRadius: spacing.radius.md,
              cursor: semanaActual === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: semanaActual === 1 ? colors.textTertiary : colors.textPrimary,
              opacity: semanaActual === 1 ? 0.5 : 1
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
          {diasSemana.map((dia) => (
            <button
              key={dia}
              onClick={() => setSelectedDay(dia)}
              style={{
                padding: `${spacing.padding.md} ${spacing.padding.lg}`,
                backgroundColor: selectedDay === dia ? colors.primary : colors.borderLight,
                color: selectedDay === dia ? colors.white : colors.textPrimary,
                border: 'none',
                borderRadius: spacing.radius.md,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize',
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
            </button>
          ))}
        </div>
      </Card>

      <Card title={`Clases online - ${selectedDay}`} icon={Clock}>
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
            Cargando clases...
          </div>
        ) : clasesDelDia.length === 0 ? (
          <div style={{
            padding: spacing.padding.xlarge,
            textAlign: 'center',
            color: colors.textTertiary
          }}>
            No tienes clases online con alumnos inscritos en este día
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: spacing.gap.normal
          }}>
            {clasesDelDia.map(clase => (
              <div
                key={clase.id}
                style={{
                  padding: spacing.padding.lg,
                  backgroundColor: '#f8f9ff',
                  border: `2px solid ${colors.primary}`,
                  borderRadius: spacing.radius.md,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing.gap.normal
                }}
              >
                <div>
                  <p style={{
                    fontSize: '12px',
                    color: colors.primary,
                    fontWeight: '600',
                    margin: '0 0 4px 0',
                    textTransform: 'uppercase'
                  }}>
                    Tema {clase.numeroTema}
                  </p>
                  <p style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: colors.textPrimary,
                    margin: 0
                  }}>
                    {clase.nombreTema}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.gap.tight,
                  fontSize: '14px',
                  color: colors.textSecondary
                }}>
                  <Clock size={16} />
                  {clase.horaInicio} - {clase.horaFin}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.gap.tight,
                  fontSize: '14px',
                  color: colors.textSecondary
                }}>
                  <Users size={16} />
                  {clase.alumnosAgendados} / {clase.capacidadMaxima} alumnos
                </div>

                {clase.linkZoom ? (
                  <div style={{
                    padding: spacing.padding.md,
                    backgroundColor: '#e8f5e9',
                    borderRadius: spacing.radius.md,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.gap.tight
                  }}>
                    <ExternalLink size={16} color={colors.success} />
                    <button
                      onClick={() => copiarLink(clase.linkZoom)}
                      style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: colors.success,
                        fontSize: '12px',
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={clase.linkZoom}
                    >
                      {clase.linkZoom.length > 40 ? clase.linkZoom.substring(0, 40) + '...' : clase.linkZoom}
                    </button>
                    <Copy size={14} style={{ cursor: 'pointer' }} color={colors.success} />
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth={true}
                    onClick={() => {
                      const linkZoom = prompt('Ingresa el link de Zoom (ej: https://zoom.us/j/123456789):');
                      if (linkZoom && linkZoom.trim()) {
                        actualizarLinkZoom(clase.id, linkZoom.trim());
                      }
                    }}
                    disabled={updatingZoom === clase.id}
                  >
                    {updatingZoom === clase.id ? 'Actualizando...' : '+ Agregar link Zoom'}
                  </Button>
                )}
              </div>
            ))}
          </div>
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

export default MisClasesConInscriptosProfesor;
