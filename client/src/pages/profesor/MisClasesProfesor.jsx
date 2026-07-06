import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Circle, Save, Settings, AlertCircle, Loader } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
<<<<<<< Updated upstream

const MisClasesProfesor = () => {
  const [disponibilidades, setDisponibilidades] = useState({});
  const [selectedDay, setSelectedDay] = useState('lunes');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [config, setConfig] = useState({
    horaInicio: 9,
    horaFin: 17,
    intervaloMinutos: 90,
  });
=======
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
>>>>>>> Stashed changes

  const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

  const cargarDisponibilidades = async () => {
    try {
      setLoading(true);
<<<<<<< Updated upstream
      const datosSimulados = {
        lunes: [
          { id: 1, horaInicio: '09:00', horaFin: '10:30', disponible: true },
          { id: 2, horaInicio: '10:30', horaFin: '12:00', disponible: false },
          { id: 3, horaInicio: '12:00', horaFin: '13:30', disponible: true },
          { id: 4, horaInicio: '13:30', horaFin: '15:00', disponible: true },
          { id: 5, horaInicio: '15:00', horaFin: '16:30', disponible: false },
        ],
        martes: [
          { id: 6, horaInicio: '09:00', horaFin: '10:30', disponible: true },
          { id: 7, horaInicio: '10:30', horaFin: '12:00', disponible: true },
          { id: 8, horaInicio: '12:00', horaFin: '13:30', disponible: false },
          { id: 9, horaInicio: '13:30', horaFin: '15:00', disponible: true },
          { id: 10, horaInicio: '15:00', horaFin: '16:30', disponible: true },
        ],
        miércoles: [
          { id: 11, horaInicio: '09:00', horaFin: '10:30', disponible: false },
          { id: 12, horaInicio: '10:30', horaFin: '12:00', disponible: true },
          { id: 13, horaInicio: '12:00', horaFin: '13:30', disponible: true },
          { id: 14, horaInicio: '13:30', horaFin: '15:00', disponible: true },
          { id: 15, horaInicio: '15:00', horaFin: '16:30', disponible: true },
        ],
        jueves: [
          { id: 16, horaInicio: '09:00', horaFin: '10:30', disponible: true },
          { id: 17, horaInicio: '10:30', horaFin: '12:00', disponible: true },
          { id: 18, horaInicio: '12:00', horaFin: '13:30', disponible: true },
          { id: 19, horaInicio: '13:30', horaFin: '15:00', disponible: false },
          { id: 20, horaInicio: '15:00', horaFin: '16:30', disponible: true },
        ],
        viernes: [
          { id: 21, horaInicio: '09:00', horaFin: '10:30', disponible: true },
          { id: 22, horaInicio: '10:30', horaFin: '12:00', disponible: false },
          { id: 23, horaInicio: '12:00', horaFin: '13:30', disponible: true },
          { id: 24, horaInicio: '13:30', horaFin: '15:00', disponible: true },
          { id: 25, horaInicio: '15:00', horaFin: '16:30', disponible: true },
        ],
      };
      setDisponibilidades(datosSimulados);
      setError(null);
=======
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
        setDisponibilidades(data.data || {});
        setOriginalDisponibilidades(JSON.parse(JSON.stringify(data.data || {})));
        setError(null);
        setDiasConCambios([]);
      } else {
        setError(data.message || 'Error al cargar disponibilidades');
      }
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      setSuccess('¡Disponibilidades guardadas correctamente!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al guardar los cambios');
      console.error(err);
=======

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

      const idsYEstados = bloquesDelDia.map(b => ({
        id: b.id,
        disponible: b.disponible
      }));

      console.log('📝 Guardando cambios:', { profesorId, día: selectedDay, bloques: idsYEstados });

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
>>>>>>> Stashed changes
    } finally {
      setSaving(false);
    }
  };

  const generarBloques = async () => {
    try {
      setSaving(true);
<<<<<<< Updated upstream
      await cargarDisponibilidades();
      setShowSettings(false);
      setSuccess('Bloques generados correctamente');
      setTimeout(() => setSuccess(null), 3000);
=======
      if (!profesorId) {
        setError('No se pudo identificar al profesor');
        return;
      }

      const token = authService.getToken();
      const response = await fetch(
        `http://localhost:5000/api/disponibilidades/${profesorId}/generar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            diasLaboral: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes']
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        await cargarDisponibilidades();
        setShowSettings(false);
        setSuccess('Bloques generados correctamente');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Error al generar bloques');
      }
>>>>>>> Stashed changes
    } catch (err) {
      setError('Error al generar bloques');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleBloque = (bloqueId) => {
<<<<<<< Updated upstream
    setDisponibilidades(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(bloque =>
        bloque.id === bloqueId ? { ...bloque, disponible: !bloque.disponible } : bloque
      )
    }));
=======
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
>>>>>>> Stashed changes
  };

  const toggleTodosDelDia = () => {
    const todosDisponibles = disponibilidades[selectedDay]?.every(b => b.disponible);
<<<<<<< Updated upstream
    setDisponibilidades(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(bloque => ({
        ...bloque,
        disponible: !todosDisponibles
      }))
    }));
=======
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
>>>>>>> Stashed changes
  };

  useEffect(() => {
    cargarDisponibilidades();
  }, []);

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
<<<<<<< Updated upstream
        <div>
=======
        <div style={{ flex: 1 }}>
>>>>>>> Stashed changes
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: colors.textPrimary,
            margin: '0 0 8px 0'
          }}>
            Mis clases - Disponibilidad
          </h2>
          <p style={{
<<<<<<< Updated upstream
            fontSize: '14px',
=======
            fontSize: '20px',
>>>>>>> Stashed changes
            color: colors.textSecondary,
            margin: 0
          }}>
            Gestiona tu disponibilidad para que los alumnos puedan reservar tus clases
          </p>
        </div>

<<<<<<< Updated upstream
        <Button
          variant="primary"
          onClick={() => setShowSettings(!showSettings)}
          icon={Settings}
        >
          Configurar
        </Button>
=======
        {Object.keys(disponibilidades).length === 0 && !loading && (
          <Button
            variant="primary"
            onClick={generarBloques}
            icon={Settings}
            disabled={saving}
          >
            {saving ? 'Generando...' : 'Generar horarios'}
          </Button>
        )}
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
      {/* Modal de Configuración */}
      {showSettings && (
        <ModalConfiguracion
          config={config}
          setConfig={setConfig}
          onGenerate={generarBloques}
          onClose={() => setShowSettings(false)}
          loading={saving}
        />
      )}
=======
>>>>>>> Stashed changes

      {/* Selector de días y resumen */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: spacing.gap.spacious,
        marginBottom: spacing.margin.xlarge
      }}>
        <Card title="Días disponibles" icon={Calendar}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
            gap: spacing.gap.tight
          }}>
<<<<<<< Updated upstream
            {diasSemana.map((dia) => (
              <button
                key={dia}
                onClick={() => setSelectedDay(dia)}
                style={{
                  padding: spacing.padding.lg,
                  backgroundColor: selectedDay === dia ? colors.primary : colors.borderLight,
                  color: selectedDay === dia ? colors.white : colors.textPrimary,
                  border: 'none',
                  borderRadius: spacing.radius.md,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize',
                  textAlign: 'center'
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
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
              size="sm"
=======
              size="md"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
              marginBottom: spacing.margin.lg
=======
              marginBottom: spacing.margin.xlarge
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
              size="lg"
              style={{ marginTop: spacing.margin.lg }}
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
const ModalConfiguracion = ({ config, setConfig, onGenerate, onClose, loading }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '16px 16px 0 0',
        maxHeight: '80vh',
        overflowY: 'auto',
        width: '100%',
        maxWidth: '500px',
        padding: spacing.padding.xlarge,
        animation: 'slideUp 0.3s ease',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.margin.xlarge
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: colors.textPrimary,
            margin: 0
          }}>
            Configurar disponibilidad
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: spacing.radius.full,
              border: 'none',
              backgroundColor: colors.borderLight,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: spacing.margin.lg }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing.margin.sm
          }}>
            Hora de inicio
          </label>
          <input
            type="number"
            min="6"
            max="23"
            value={config.horaInicio}
            onChange={(e) => setConfig({ ...config, horaInicio: parseInt(e.target.value) })}
            style={{
              width: '100%',
              padding: spacing.padding.md,
              fontSize: '14px',
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.radius.md,
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: spacing.margin.lg }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing.margin.sm
          }}>
            Hora de fin
          </label>
          <input
            type="number"
            min="6"
            max="23"
            value={config.horaFin}
            onChange={(e) => setConfig({ ...config, horaFin: parseInt(e.target.value) })}
            style={{
              width: '100%',
              padding: spacing.padding.md,
              fontSize: '14px',
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.radius.md,
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: spacing.margin.xlarge }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: colors.textPrimary,
            marginBottom: spacing.margin.sm
          }}>
            Duración de cada bloque (minutos)
          </label>
          <select
            value={config.intervaloMinutos}
            onChange={(e) => setConfig({ ...config, intervaloMinutos: parseInt(e.target.value) })}
            style={{
              width: '100%',
              padding: spacing.padding.md,
              fontSize: '14px',
              border: `1px solid ${colors.border}`,
              borderRadius: spacing.radius.md,
              boxSizing: 'border-box'
            }}
          >
            <option value={30}>30 minutos</option>
            <option value={60}>1 hora</option>
            <option value={90}>1 hora 30 minutos</option>
            <option value={120}>2 horas</option>
          </select>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing.gap.normal
        }}>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onGenerate} disabled={loading}>
            {loading ? 'Generando...' : 'Generar'}
          </Button>
        </div>

        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

=======
>>>>>>> Stashed changes
export default MisClasesProfesor;
