import React, { useState, useEffect } from 'react';
import { Users, CalendarClock, UserPlus, Car, Clock, Activity } from 'lucide-react';
import { Card, Button } from '../../components/shared/index.js';
import { colors, spacing } from '../../theme/index.js';
import { authService } from '../../services/authService.js';

const InicioView = ({ secretariaNombre, statsData, setActiveTab, sedesDisponibles }) => {
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      if (!sedesDisponibles || sedesDisponibles.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const token = authService.getToken();
        
        const promises = sedesDisponibles.map(sede =>
          fetch(`http://localhost:5000/api/solicitudes-auto/sede/${sede.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.json())
        );

        const results = await Promise.all(promises);
        let allSolicitudes = [];

        results.forEach(res => {
          if (res.success && res.data) {
            allSolicitudes = [...allSolicitudes, ...res.data];
          }
        });

        const pendientes = allSolicitudes
          .filter(sol => sol.estado === 'pendiente')
          .slice(0, 5); 
          
        setSolicitudesPendientes(pendientes);
      } catch (error) {
        console.error("Error al cargar solicitudes pendientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [sedesDisponibles]);

  const stats = [
    { icon: Users, label: 'Alumnos registrados', value: statsData.totalAlumnos, color: '#3b82f6' },
    { icon: Users, label: 'Profesores activos', value: statsData.totalProfesores, color: '#10b981' },
    { icon: Car, label: 'Vehículos en flota', value: statsData.totalAutos, color: '#f59e0b' },
  ];

  // Definimos las tareas rápidas en un arreglo para mantener el código limpio (Estilo Profesor/Alumno)
  const tareasRapidas = [
    { id: 1, titulo: 'Ingresar alumno nuevo', icon: UserPlus, tab: 'alumnos', actionText: 'Registrar' },
    { id: 2, titulo: 'Reservas de Vehículos', icon: Car, tab: 'vehiculos', actionText: 'Gestionar' },
    { id: 3, titulo: 'Horario Sala Psicotécnica', icon: Activity, tab: 'psicotecnico', actionText: 'Configurar' }
  ];

  return (
    <div>
      <div style={{ marginBottom: spacing.margin.xlarge }}>
        <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: colors.textPrimary, margin: '0 0 8px 0' }}>
          Panel de Control - {secretariaNombre}
        </h2>
        <p style={{ color: colors.textTertiary, margin: 0, fontSize: '14px' }}>
          Gestión de la escuela de conductores
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing.gap.spacious, marginBottom: spacing.margin.xlarge }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} style={{ background: `linear-gradient(135deg, ${stat.color}80 0%, ${stat.color} 100%)`, borderRadius: spacing.radius.lg, padding: spacing.padding.xlarge, color: colors.white, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.margin.md }}>
                <Icon size={32} opacity={0.8} />
                <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{stat.value}</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.gap.spacious }}>
        
        <Card title="Solicitudes de Vehículos Pendientes" icon={Car}>
          <div style={{ display: 'grid', gap: spacing.gap.normal }}>
            {loading ? (
              <p style={{ color: colors.textTertiary, textAlign: 'center', padding: '20px 0' }}>Consultando solicitudes...</p>
            ) : solicitudesPendientes.length === 0 ? (
              <p style={{ color: colors.textTertiary, textAlign: 'center', padding: '20px 0' }}>No hay solicitudes pendientes de asignación en ninguna sede.</p>
            ) : (
              solicitudesPendientes.map((sol) => (
                <div key={sol.id} style={{ padding: spacing.padding.lg, backgroundColor: colors.background, borderRadius: spacing.radius.md, borderLeft: `4px solid #eab308`, transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.borderLight} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.background}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '15px', color: colors.textPrimary, margin: '0 0 4px 0', textTransform: 'capitalize' }}>
                        Solicitud de {sol.tipo_solicitante}
                      </p>
                      <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14}/> {sol.fecha_uso} ({sol.hora_uso} - {sol.hora_termino})
                      </p>
                      <p style={{ fontSize: '12px', color: colors.textTertiary, margin: 0 }}>
                        Sede: <strong>{sol.sede?.nombre}</strong>
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('vehiculos')}
                      style={{ backgroundColor: colors.white, border: `1px solid ${colors.borderLight}`, padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: colors.secretaria, fontWeight: 'bold' }}
                    >
                      Revisar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* DISEÑO DE TAREAS RÁPIDAS HOMOLOGADO */}
        <Card title="Tareas Rápidas" icon={CalendarClock}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: spacing.gap.normal
          }}>
            {tareasRapidas.map((tarea) => {
              const TareaIcon = tarea.icon;
              return (
                <div
                  key={tarea.id}
                  onClick={() => setActiveTab(tarea.tab)} // <-- ESTO CAMBIA LA PESTAÑA AL HACER CLIC EN LA TARJETA
                  style={{
                    padding: spacing.padding.lg,
                    backgroundColor: colors.background,
                    borderRadius: spacing.radius.md,
                    borderLeft: `4px solid ${colors.secretaria}`,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.borderLight;
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.background;
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: spacing.margin.sm
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.gap.normal }}>
                      <TareaIcon size={20} color={colors.secretaria} />
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        margin: 0
                      }}>
                        {tarea.titulo}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    fullWidth={true}
                    onClick={(e) => {
                      e.stopPropagation(); // Evita que el clic en el botón dispare también el clic de la tarjeta
                      setActiveTab(tarea.tab); // <-- ESTO CAMBIA LA PESTAÑA AL HACER CLIC EN EL BOTÓN
                    }}
                  >
                    {tarea.actionText}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InicioView;