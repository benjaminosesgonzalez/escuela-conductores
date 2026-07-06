import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, Loader, AlertCircle, CheckCircle, User } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';

const ReservarClaseAlumno = () => {
  const [profesoresDisponibles, setProfesoresDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [selectedDay, setSelectedDay] = useState('lunes');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [tipoClase, setTipoClase] = useState('teorica');

  const [reservando, setReservando] = useState(null);

  const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

  const horasDisponibles = Array.from({ length: 17 }, (_, i) => {
    const hora = i + 8;
    return {
      label: `${String(hora).padStart(2, '0')}:00`,
      value: `${String(hora).padStart(2, '0')}:00`
    };
  });

  const cargarProfesoresDisponibles = async () => {
    try {
      setLoading(true);
      setError(null);

      const datosSimulados = [
        {
          id: 1,
          profesor: {
            id: 101,
            nombre: 'Juan Pérez García',
            experiencia: 5,
            calificacion: 4.8,
            estudiantes: 45
          },
          disponibilidad: {
            id: 1,
            horaInicio: '09:00',
            horaFin: '10:30',
            tipo: tipoClase
          },
          precioBase: 25000
        },
        {
          id: 2,
          profesor: {
            id: 102,
            nombre: 'María López Sánchez',
            experiencia: 8,
            calificacion: 4.9,
            estudiantes: 62
          },
          disponibilidad: {
            id: 6,
            horaInicio: '09:00',
            horaFin: '10:30',
            tipo: tipoClase
          },
          precioBase: 30000
        }
      ];

      setProfesoresDisponibles(datosSimulados);
    } catch (err) {
      setError('No se pudieron cargar los profesores disponibles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reservarClase = async (disponibilidadId, profesorId) => {
    try {
      setReservando(disponibilidadId);
      setSuccess('¡Clase reservada exitosamente!');
      setTimeout(() => setSuccess(null), 3000);

      setProfesoresDisponibles(prev =>
        prev.filter(p => p.disponibilidad.id !== disponibilidadId)
      );
    } catch (err) {
      setError('Error al reservar la clase');
      console.error(err);
    } finally {
      setReservando(null);
    }
  };

  useEffect(() => {
    cargarProfesoresDisponibles();
  }, [selectedDay, selectedTime, tipoClase]);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: spacing.margin.xlarge }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: colors.textPrimary,
          margin: '0 0 8px 0'
        }}>
          Reservar mis clases
        </h2>
        <p style={{
          fontSize: '14px',
          color: colors.textSecondary,
          margin: 0
        }}>
          Selecciona un profesor disponible para tu siguiente clase
        </p>
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

      {/* Filtros */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing.gap.normal,
        marginBottom: spacing.margin.xlarge
      }}>
        <Card>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: spacing.margin.sm,
            textTransform: 'uppercase'
          }}>
            <Calendar size={16} style={{ display: 'inline', marginRight: spacing.gap.tight }} />
            Día
          </label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            style={{
              width: '100%',
              padding: spacing.padding.md,
              fontSize: '14px',
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.radius.md,
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          >
            {diasSemana.map(dia => (
              <option key={dia} value={dia}>
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </option>
            ))}
          </select>
        </Card>

        <Card>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: spacing.margin.sm,
            textTransform: 'uppercase'
          }}>
            <Clock size={16} style={{ display: 'inline', marginRight: spacing.gap.tight }} />
            Hora
          </label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            style={{
              width: '100%',
              padding: spacing.padding.md,
              fontSize: '14px',
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.radius.md,
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          >
            {horasDisponibles.map(hora => (
              <option key={hora.value} value={hora.value}>
                {hora.label}
              </option>
            ))}
          </select>
        </Card>

        <Card>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: spacing.margin.sm,
            textTransform: 'uppercase'
          }}>
            <Filter size={16} style={{ display: 'inline', marginRight: spacing.gap.tight }} />
            Tipo de clase
          </label>
          <select
            value={tipoClase}
            onChange={(e) => setTipoClase(e.target.value)}
            style={{
              width: '100%',
              padding: spacing.padding.md,
              fontSize: '14px',
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.radius.md,
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          >
            <option value="teorica">Teórica</option>
            <option value="practica">Práctica</option>
          </select>
        </Card>
      </div>

      {/* Lista de Profesores */}
      {loading ? (
        <Card>
          <div style={{
            textAlign: 'center',
            padding: spacing.padding.xlarge,
            color: colors.textTertiary
          }}>
            <Loader size={32} style={{
              margin: '0 auto 12px',
              animation: 'spin 1s linear infinite'
            }} />
            Cargando profesores disponibles...
          </div>
        </Card>
      ) : profesoresDisponibles.length === 0 ? (
        <Card>
          <div style={{
            padding: spacing.padding.xlarge,
            textAlign: 'center',
            color: colors.textSecondary
          }}>
            <AlertCircle size={48} style={{
              color: colors.border,
              margin: '0 auto 16px',
              display: 'block'
            }} />
            <p style={{
              fontSize: '16px',
              color: colors.textSecondary,
              margin: 0
            }}>
              No hay profesores disponibles en este horario
            </p>
            <p style={{
              fontSize: '13px',
              color: colors.textTertiary,
              margin: '8px 0 0 0'
            }}>
              Intenta seleccionar otro día u hora
            </p>
          </div>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: spacing.gap.spacious
        }}>
          {profesoresDisponibles.map((item) => (
            <Card key={item.id} hoverable={true} style={{
              backgroundColor: colors.profesor,
              backgroundImage: `linear-gradient(135deg, ${colors.profesor}90 0%, ${colors.profesor} 100%)`
            }}>
              <div style={{ color: colors.white }}>
                {/* Profesor Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.gap.normal,
                  marginBottom: spacing.margin.lg,
                  paddingBottom: spacing.padding.lg,
                  borderBottom: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: spacing.radius.full,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <User size={28} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      margin: 0,
                      marginBottom: spacing.margin.xs
                    }}>
                      {item.profesor.nombre}
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      margin: 0,
                      opacity: 0.9
                    }}>
                      {item.profesor.experiencia} años de experiencia
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.gap.tight,
                  marginBottom: spacing.margin.lg
                }}>
                  <span style={{ fontSize: '18px' }}>⭐</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {item.profesor.calificacion}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    opacity: 0.8
                  }}>
                    ({item.profesor.estudiantes} alumnos)
                  </span>
                </div>

                {/* Horario */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.gap.normal,
                  marginBottom: spacing.margin.lg,
                  paddingBottom: spacing.padding.lg,
                  borderBottom: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Clock size={18} />
                  <div>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      {item.disponibilidad.horaInicio} - {item.disponibilidad.horaFin}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      margin: '4px 0 0 0',
                      opacity: 0.8
                    }}>
                      1 hora 30 minutos
                    </p>
                  </div>
                </div>

                {/* Precio */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: spacing.gap.tight,
                  marginBottom: spacing.margin.lg
                }}>
                  <span style={{ fontSize: '12px' }}>Valor:</span>
                  <span style={{
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    ${item.precioBase.toLocaleString('es-CL')}
                  </span>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>CLP</span>
                </div>

                {/* Botón */}
                <Button
                  variant="success"
                  fullWidth={true}
                  onClick={() => reservarClase(item.disponibilidad.id, item.profesor.id)}
                  disabled={reservando === item.disponibilidad.id}
                >
                  {reservando === item.disponibilidad.id ? 'Reservando...' : 'Reservar clase'}
                </Button>
              </div>
            </Card>
          ))}
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

export default ReservarClaseAlumno;
